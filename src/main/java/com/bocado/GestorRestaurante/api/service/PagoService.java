package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.CheckoutResponse;
import com.bocado.GestorRestaurante.api.dto.PagoRequest;
import com.bocado.GestorRestaurante.api.dto.PagoResponse;
import com.bocado.GestorRestaurante.api.exception.OperacionInvalidaException;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.MetodoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.PagoRepository;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {
    private final PagoRepository pagoRepository;
    private final TurnoRepository turnoRepository;
    private final MercadoPagoService mercadoPagoService;
    private final QrService qrService;
    private final EmailService emailService;

    public Pago crearPago(PagoRequest request) {
        return crearPago(request.getMonto());
    }

    public Pago crearPago(BigDecimal monto) {
        Pago pago = new Pago();
        pago.setMonto(monto);
        pago.setEstado(EstadoPago.PENDIENTE);
        pago.setFechaCreacion(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    public PagoResponse obtenerPago(Long id) {
        return new PagoResponse(buscarPago(id));
    }

    // El total del turno puede cambiar (se agregan platos): actualizamos el monto antes de cobrar.
    public void actualizarMonto(Long id, BigDecimal monto) {
        Pago pago = buscarPago(id);
        pago.setMonto(monto);
        pagoRepository.save(pago);
    }

    // Cambio el pedido de la mesa: el pago pendiente toma el nuevo total y pierde el checkout viejo,
    // asi nadie puede pagar un link armado con el monto anterior (hay que volver a cerrar el pago).
    @Transactional
    public void sincronizarMonto(Long id, BigDecimal monto) {
        Pago pago = buscarPago(id);
        pago.setMonto(monto);
        pago.setPreferenciaId(null);
        pago.setInitPoint(null);
        pagoRepository.save(pago);
    }

    // Imagen PNG del QR que el cliente escanea para pagar.
    public byte[] generarQr(Long id) {
        Pago pago = buscarPago(id);
        if (pago.getInitPoint() == null) {
            throw new OperacionInvalidaException("El pago " + id + " todavia no tiene un checkout generado");
        }
        return qrService.generarPng(pago.getInitPoint());
    }

    public PagoResponse cambiarEstado(Long id, EstadoPago estado) {
        Pago pago = buscarPago(id);
        pago.setEstado(estado);
        return new PagoResponse(pagoRepository.save(pago));
    }

    /*
     * Paso 1 del flujo: crea el link de pago en Mercado Pago.
     * Guardamos el id de la preferencia y la URL, y se la devolvemos al front.
     */
    public CheckoutResponse generarCheckout(Long pagoId) {
        Pago pago = buscarPago(pagoId);

        if (pago.getEstado() == EstadoPago.APROBADO) {
            throw new RecursoDuplicadoException("El pago " + pagoId + " ya fue aprobado");
        }

        String titulo = turnoRepository.findByPagoId(pagoId)
                .map(turno -> "Reserva Bocado - Turno #" + turno.getId())
                .orElse("Reserva Bocado - Pago #" + pagoId);

        MercadoPagoService.Preferencia preferencia =
                mercadoPagoService.crearPreferencia(pago.getId(), titulo, pago.getMonto());

        pago.setMetodo(MetodoPago.MERCADO_PAGO);
        pago.setPreferenciaId(preferencia.id());
        pago.setInitPoint(preferencia.initPoint());
        pagoRepository.save(pago);

        return new CheckoutResponse(pago.getId(), pago.getMonto(), preferencia.id(), preferencia.initPoint(),
                "/api/pagos/" + pago.getId() + "/qr");
    }

    /*
     * Paso 2 del flujo: Mercado Pago nos avisa (webhook) que hubo novedades de un pago.
     *
     * No confiamos en lo que llega en el webhook: solo usamos el id del pago
     * y le preguntamos a Mercado Pago el estado real con nuestro access token.
     */
    @Transactional
    public void procesarNotificacionPago(String paymentId) {
        Optional<Map<String, Object>> datos = mercadoPagoService.obtenerPago(paymentId);
        if (datos.isEmpty()) {
            log.warn("Mercado Pago no conoce el pago {}: se ignora la notificacion", paymentId);
            return;
        }

        Object referencia = datos.get().get("external_reference");
        Long pagoId = parsearId(referencia);
        if (pagoId == null) {
            log.warn("El pago {} de MP no tiene un external_reference valido: se ignora", paymentId);
            return;
        }

        Optional<Pago> pagoOpt = pagoRepository.buscarParaActualizar(pagoId);
        if (pagoOpt.isEmpty()) {
            log.warn("El pago {} de MP referencia un Pago inexistente ({}): se ignora", paymentId, pagoId);
            return;
        }

        Pago pago = pagoOpt.get();
        EstadoPago nuevoEstado = traducirEstado(String.valueOf(datos.get().get("status")));

        pago.setMercadoPagoId(paymentId);

        // Un pago ya aprobado no vuelve atras por una notificacion vieja o de otro intento.
        boolean yaAprobado = pago.getEstado() == EstadoPago.APROBADO;
        if (nuevoEstado != null && !yaAprobado) {
            pago.setEstado(nuevoEstado);
            if (nuevoEstado == EstadoPago.APROBADO) {
                pago.setMetodo(MetodoPago.MERCADO_PAGO);
                pago.setFechaPago(LocalDateTime.now());
            }
        }
        pagoRepository.save(pago);
        log.info("Pago {} actualizado a {} (pago MP {})", pagoId, pago.getEstado(), paymentId);

        // Si se aprobo, confirmamos el turno asociado y, solo la primera vez, mandamos el recibo.
        boolean recienAprobado = !yaAprobado && pago.getEstado() == EstadoPago.APROBADO;
        if (pago.getEstado() == EstadoPago.APROBADO) {
            turnoRepository.findByPagoId(pagoId).ifPresent(turno -> {
                if (turno.getEstado() == EstadoTurno.PENDIENTE) {
                    turno.setEstado(EstadoTurno.CONFIRMADO);
                    turnoRepository.save(turno);
                }
                if (recienAprobado) {
                    emailService.enviarRecibo(turno, pago);
                }
            });
        }
    }

    /*
     * Cobro hecho en la mesa (efectivo o tarjeta con la terminal del local): lo registra el mozo.
     *
     * Es IDEMPOTENTE, porque la app del mozo puede reintentar el envio si se corto la conexion:
     *  - turno ya cobrado con el MISMO metodo  -> responde OK con el pago existente (sin duplicar nada).
     *  - turno ya cobrado con OTRO metodo      -> 409 (un cobro distinto ya fue registrado).
     * Al aprobarse: confirma el turno y manda el comprobante por mail, igual que con Mercado Pago.
     */
    @Transactional
    public PagoResponse registrarCobroManual(Long turnoId, MetodoPago metodo, LocalDateTime cobradoEn) {
        if (metodo != MetodoPago.EFECTIVO && metodo != MetodoPago.TARJETA) {
            throw new OperacionInvalidaException("Solo se puede registrar un cobro manual en EFECTIVO o TARJETA");
        }

        Turno turno = turnoRepository.buscarParaActualizar(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + turnoId));

        BigDecimal total = turno.calcularTotal();
        if (total.signum() <= 0) {
            throw new OperacionInvalidaException("El turno " + turnoId + " no tiene platos para cobrar");
        }

        Pago pago = turno.getPago();
        if (pago == null) {
            pago = crearPago(total);
            turno.setPago(pago);
        } else {
            Long pagoId = pago.getId();
            pago = pagoRepository.buscarParaActualizar(pagoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado con id: " + pagoId));
            if (pago.getEstado() == EstadoPago.APROBADO) {
                if (pago.getMetodo() == metodo) {
                    return new PagoResponse(pago); // reintento: ya estaba registrado
                }
                throw new RecursoDuplicadoException(
                        "El turno " + turnoId + " ya fue pagado con " + pago.getMetodo());
            }
            pago.setMonto(total);
        }

        LocalDateTime ahora = LocalDateTime.now();
        pago.setMetodo(metodo);
        pago.setEstado(EstadoPago.APROBADO);
        pago.setFechaPago(cobradoEn == null || cobradoEn.isAfter(ahora) ? ahora : cobradoEn);
        pagoRepository.save(pago);

        if (turno.getEstado() == EstadoTurno.PENDIENTE) {
            turno.setEstado(EstadoTurno.CONFIRMADO);
        }
        turnoRepository.save(turno);

        emailService.enviarRecibo(turno, pago);
        return new PagoResponse(pago);
    }

    // Atajo que usa la pantalla web del mozo: cobro en efectivo "ahora".
    @Transactional
    public PagoResponse pagarEnEfectivo(Long turnoId) {
        return registrarCobroManual(turnoId, MetodoPago.EFECTIVO, null);
    }

    // Reenvia el recibo de un pago ya aprobado (por si el mail no llego o se escribio mal).
    @Transactional(readOnly = true)
    public String reenviarRecibo(Long id) {
        Pago pago = buscarPago(id);
        if (pago.getEstado() != EstadoPago.APROBADO) {
            throw new OperacionInvalidaException("El pago " + id + " todavia no esta aprobado");
        }
        var turno = turnoRepository.findByPagoId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No hay una reserva asociada al pago " + id));
        emailService.enviarRecibo(turno, pago);
        return turno.getCliente() != null ? turno.getCliente().getEmail() : null;
    }

    // Traduce el estado de Mercado Pago a nuestro EstadoPago. null = no cambiar nada.
    private EstadoPago traducirEstado(String estadoMp) {
        return switch (estadoMp) {
            case "approved" -> EstadoPago.APROBADO;
            case "rejected", "cancelled" -> EstadoPago.RECHAZADO;
            case "pending", "in_process", "in_mediation", "authorized" -> EstadoPago.PENDIENTE;
            default -> null; // refunded, charged_back, etc.: por ahora no los modelamos
        };
    }

    private Long parsearId(Object valor) {
        if (valor == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(valor));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Pago buscarPago(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado con id: " + id));
    }
}
