package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.ReporteDiarioResponse;
import com.bocado.GestorRestaurante.api.model.Cliente;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.MetodoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.PagoRepository;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Logica de negocio de los reportes.
 * Todos los calculos de plata se hacen aca (en el back),
 * el front solo los muestra.
 */
@Service
public class ReporteService {

    private final TurnoRepository turnoRepository;
    private final PagoRepository pagoRepository;

    public ReporteService(TurnoRepository turnoRepository, PagoRepository pagoRepository) {
        this.turnoRepository = turnoRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional(readOnly = true)
    public ReporteDiarioResponse reporteDelDia(LocalDate fecha) {
        ReporteDiarioResponse reporte = new ReporteDiarioResponse();
        reporte.setFecha(fecha);

        calcularRecaudacion(reporte, fecha);
        calcularTurnos(reporte, fecha);

        return reporte;
    }

    // ------------------------------------------------------------------
    // 1) PLATA: pagos APROBADOS cobrados en ese dia
    // ------------------------------------------------------------------
    private void calcularRecaudacion(ReporteDiarioResponse reporte, LocalDate fecha) {
        LocalDateTime desde = fecha.atStartOfDay();      // 00:00:00
        LocalDateTime hasta = fecha.atTime(LocalTime.MAX); // 23:59:59

        List<Pago> pagos = pagoRepository.findByEstadoAndFechaPagoBetween(EstadoPago.APROBADO, desde, hasta);

        // Arrancamos todos los metodos en cero, asi aparecen aunque no se usen
        for (MetodoPago metodo : MetodoPago.values()) {
            reporte.getRecaudacionPorMetodo().put(metodo.name(), BigDecimal.ZERO);
        }

        BigDecimal total = BigDecimal.ZERO;
        int cantidad = 0;

        for (Pago pago : pagos) {
            if (pago.getMonto() == null) {
                continue;
            }
            total = total.add(pago.getMonto());
            cantidad++;

            if (pago.getMetodo() != null) {
                String clave = pago.getMetodo().name();
                BigDecimal acumulado = reporte.getRecaudacionPorMetodo().get(clave);
                reporte.getRecaudacionPorMetodo().put(clave, acumulado.add(pago.getMonto()));
            }
        }

        reporte.setRecaudacionTotal(total);
        reporte.setCantidadPagos(cantidad);

        // Ticket promedio = total / cantidad de pagos (sin dividir por cero)
        if (cantidad > 0) {
            reporte.setTicketPromedio(total.divide(BigDecimal.valueOf(cantidad), 2, RoundingMode.HALF_UP));
        }
    }

    // ------------------------------------------------------------------
    // 2) SALON: turnos del dia, comensales y mesas sin cobrar
    // ------------------------------------------------------------------
    private void calcularTurnos(ReporteDiarioResponse reporte, LocalDate fecha) {
        List<Turno> turnos = turnoRepository.findByFecha(fecha);

        for (EstadoTurno estado : EstadoTurno.values()) {
            reporte.getTurnosPorEstado().put(estado.name(), 0);
        }

        int comensales = 0;

        for (Turno turno : turnos) {
            // Conteo por estado
            if (turno.getEstado() != null) {
                String clave = turno.getEstado().name();
                reporte.getTurnosPorEstado().put(clave, reporte.getTurnosPorEstado().get(clave) + 1);
            }

            // Los cancelados no suman comensales ni deudas
            if (turno.getEstado() == EstadoTurno.CANCELADO) {
                continue;
            }

            if (turno.getCantidadComensales() != null) {
                comensales += turno.getCantidadComensales();
            }

            if (estaPendienteDeCobro(turno)) {
                reporte.getPendientesDeCobro().add(armarPendiente(turno));
            }
        }

        reporte.setCantidadTurnos(turnos.size());
        reporte.setComensales(comensales);
    }

    // Una mesa debe plata si consumio algo y no tiene un pago aprobado
    private boolean estaPendienteDeCobro(Turno turno) {
        boolean consumio = turno.getPlatos() != null && !turno.getPlatos().isEmpty();
        boolean pagado = turno.getPago() != null && turno.getPago().getEstado() == EstadoPago.APROBADO;
        return consumio && !pagado;
    }

    private ReporteDiarioResponse.PendienteCobro armarPendiente(Turno turno) {
        ReporteDiarioResponse.PendienteCobro pendiente = new ReporteDiarioResponse.PendienteCobro();
        pendiente.setTurnoId(turno.getId());
        pendiente.setHora(String.valueOf(turno.getHora()));
        pendiente.setTotal(turno.calcularTotal());

        Cliente cliente = turno.getCliente();
        if (cliente != null) {
            pendiente.setCliente(cliente.getNombre() + " " + cliente.getApellido());
        } else {
            pendiente.setCliente("Sin cliente");
        }
        return pendiente;
    }
}
