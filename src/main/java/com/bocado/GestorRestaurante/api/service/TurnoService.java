package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.CheckoutResponse;
import com.bocado.GestorRestaurante.api.dto.CobroManualRequest;
import com.bocado.GestorRestaurante.api.dto.ItemPedidoRequest;
import com.bocado.GestorRestaurante.api.dto.PedidoRequest;
import com.bocado.GestorRestaurante.api.dto.PagoRequest;
import com.bocado.GestorRestaurante.api.dto.PagoResponse;
import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.exception.OperacionInvalidaException;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Cliente;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Plato;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.ClienteRepository;
import com.bocado.GestorRestaurante.api.repository.PlatoRepository;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TurnoService {
    private final TurnoRepository turnoRepository;
    private final ClienteRepository clienteRepository;
    private final PlatoRepository platoRepository;
    private final PagoService pagoService;

    public TurnoResponse crearTurno(TurnoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + request.getClienteId()));

        Turno turno = new Turno();
        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setCliente(cliente);
        turno.setEstado(EstadoTurno.PENDIENTE);

        Turno turnoGuardado = turnoRepository.save(turno);

        return new TurnoResponse(turnoGuardado);
    }

    public List<TurnoResponse> listarTurnos() {
        return turnoRepository.findAll()
                .stream()
                .map(TurnoResponse::new)
                .toList();
    }

    public TurnoResponse obtenerTurnoPorId(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + id));
        return new TurnoResponse(turno);
    }

    public TurnoResponse actualizarTurno(Long id, TurnoRequest request) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + id));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id: " + request.getClienteId()));

        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setCliente(cliente);

        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }

    public TurnoResponse cambiarEstado(Long id, EstadoTurno estado) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + id));

        turno.setEstado(estado);
        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }

    public void eliminarTurno(Long id) {

        /*
         * Antes de eliminar, comprobamos si el turno existe.
         *
         * Si no existe, lanzamos una excepción específica.
         * Así evitamos responder como si se hubiera eliminado.
         */

        if (!turnoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Turno no encontrado con id: " + id);
        }

        // Solo eliminamos si el turno realmente existe.
        turnoRepository.deleteById(id);
    }


    public TurnoResponse agregarPlato(Long turnoId, Long platoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + turnoId));
        Plato plato = platoRepository.findById(platoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plato no encontrado con id: " + platoId));

        turno.getPlatos().add(plato);
        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }


    /*
     * Fija el pedido completo de la mesa (el mozo agrega, quita o cambia cantidades).
     *
     * Es IDEMPOTENTE: manda el estado final, no "sumar uno mas". Repetir la misma llamada
     * (reintento de la app despues de cortarse el wifi) deja exactamente el mismo resultado.
     * Si dos mozos editan la misma mesa a la vez, gana el ultimo en guardar.
     */
    @Transactional
    public TurnoResponse reemplazarPlatos(Long turnoId, PedidoRequest request) {
        Turno turno = turnoRepository.buscarParaActualizar(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + turnoId));

        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new RecursoDuplicadoException("El turno " + turnoId + " esta cancelado: no se le pueden modificar los platos");
        }
        Pago pago = turno.getPago();
        if (pago != null && pago.getEstado() == EstadoPago.APROBADO) {
            throw new RecursoDuplicadoException("El turno " + turnoId + " ya fue pagado: no se le pueden modificar los platos");
        }

        // platoId -> cantidad (un plato repetido en el pedido es un error de quien lo arma)
        Map<Long, Integer> cantidades = new LinkedHashMap<>();
        for (ItemPedidoRequest item : request.getItems()) {
            if (cantidades.putIfAbsent(item.getPlatoId(), item.getCantidad()) != null) {
                throw new OperacionInvalidaException("El plato " + item.getPlatoId() + " esta repetido en el pedido");
            }
        }

        Map<Long, Plato> platos = platoRepository.findAllById(cantidades.keySet()).stream()
                .collect(Collectors.toMap(Plato::getId, plato -> plato));
        List<Long> faltantes = cantidades.keySet().stream().filter(id -> !platos.containsKey(id)).toList();
        if (!faltantes.isEmpty()) {
            throw new RecursoNoEncontradoException("Platos no encontrados con id: " + faltantes);
        }

        // El turno guarda una entrada por unidad (asi suma el total): 2 pizzas = 2 filas.
        List<Plato> nuevos = new ArrayList<>();
        cantidades.forEach((id, cantidad) -> {
            for (int i = 0; i < cantidad; i++) {
                nuevos.add(platos.get(id));
            }
        });
        turno.getPlatos().clear();
        turno.getPlatos().addAll(nuevos);
        Turno guardado = turnoRepository.save(turno);

        // Si ya habia una cuenta cerrada sin pagar, se actualiza al nuevo total.
        if (pago != null) {
            pagoService.sincronizarMonto(pago.getId(), guardado.calcularTotal());
        }
        return new TurnoResponse(guardado);
    }

    public TurnoResponse asociarPago(Long turnoId, PagoRequest request) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + turnoId));

        Pago pago = pagoService.crearPago(request);
        turno.setPago(pago);

        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }

    /*
     * "Cerrar pago": el mozo cierra la cuenta del turno.
     *
     * 1) El monto es la suma de los platos asignados al turno.
     * 2) Se crea el Pago (o se reutiliza el pendiente y se actualiza el monto).
     * 3) Se genera el checkout de Mercado Pago, cuyo link se muestra como QR.
     */
    public CheckoutResponse cerrarPago(Long turnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado con id: " + turnoId));

        java.math.BigDecimal total = turno.calcularTotal();
        if (total.signum() <= 0) {
            throw new OperacionInvalidaException("El turno " + turnoId + " no tiene platos para cobrar");
        }

        Pago pago = turno.getPago();
        if (pago != null && pago.getEstado() == EstadoPago.APROBADO) {
            throw new RecursoDuplicadoException("El turno " + turnoId + " ya fue pagado");
        }

        if (pago == null) {
            pago = pagoService.crearPago(total);
            turno.setPago(pago);
            turnoRepository.save(turno);
        } else {
            pagoService.actualizarMonto(pago.getId(), total);
        }

        return pagoService.generarCheckout(pago.getId());
    }

    // El mozo cobra la cuenta en efectivo: aprueba el pago al instante.
    public PagoResponse pagarEnEfectivo(Long turnoId) {
        return pagoService.pagarEnEfectivo(turnoId);
    }

    // Cobro registrado por el mozo en la mesa (efectivo o tarjeta). Idempotente.
    public PagoResponse registrarCobroManual(Long turnoId, CobroManualRequest request) {
        return pagoService.registrarCobroManual(turnoId, request.getMetodo(), request.getCobradoEn());
    }
}
