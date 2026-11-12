package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.ReporteSemanalResponse;
import com.bocado.GestorRestaurante.api.dto.ReporteSemanalResponse.DiaVenta;
import com.bocado.GestorRestaurante.api.dto.ReporteSemanalResponse.PlatoVendido;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Plato;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.PagoRepository;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Reporte de ventas de 7 dias.
 *
 * - Recaudacion: pagos APROBADOS, por el dia en que se cobraron.
 * - Platos vendidos: los platos de los turnos que se pagaron ese dia.
 *   Como Turno guarda la lista de platos (un plato repetido = varias unidades),
 *   la cantidad es cuantas veces aparece el plato en la lista.
 * - Variacion: contra el MISMO dia de la semana anterior (martes vs martes),
 *   porque en un restaurante cada dia de la semana vende distinto.
 */
@Service
public class ReporteSemanalService {

    private static final Locale ESPANOL = Locale.of("es", "AR");

    private final PagoRepository pagoRepository;
    private final TurnoRepository turnoRepository;

    public ReporteSemanalService(PagoRepository pagoRepository, TurnoRepository turnoRepository) {
        this.pagoRepository = pagoRepository;
        this.turnoRepository = turnoRepository;
    }

    @Transactional(readOnly = true)
    public ReporteSemanalResponse reporteSemanal(LocalDate hasta) {
        LocalDate desde = hasta.minusDays(6);

        ReporteSemanalResponse reporte = new ReporteSemanalResponse();
        reporte.setDesde(desde);
        reporte.setHasta(hasta);

        // Para la semana completa vamos sumando las ventas de cada plato
        Map<Long, PlatoVendido> ventasSemana = new LinkedHashMap<>();

        for (LocalDate fecha = desde; !fecha.isAfter(hasta); fecha = fecha.plusDays(1)) {
            List<Pago> pagosDelDia = pagosAprobados(fecha);

            DiaVenta dia = new DiaVenta();
            dia.setFecha(fecha);
            dia.setNombreDia(nombreDelDia(fecha));
            dia.setRecaudacion(sumar(pagosDelDia));
            dia.setCantidadPagos(pagosDelDia.size());
            dia.setVariacion(variacion(dia.getRecaudacion(), sumar(pagosAprobados(fecha.minusWeeks(1)))));

            // Platos vendidos ese dia
            Map<Long, PlatoVendido> ventasDia = new LinkedHashMap<>();
            for (Pago pago : pagosDelDia) {
                turnoRepository.findByPagoId(pago.getId()).ifPresent(turno -> {
                    sumarPlatos(turno, ventasDia);
                    sumarPlatos(turno, ventasSemana);
                });
            }
            dia.setPlatoTop(masVendidos(ventasDia).stream().findFirst().orElse(null));

            reporte.getDias().add(dia);
            reporte.setTotalSemana(reporte.getTotalSemana().add(dia.getRecaudacion()));
        }

        reporte.setRankingPlatos(masVendidos(ventasSemana));
        return reporte;
    }

    // ------------------------------------------------------------------

    private List<Pago> pagosAprobados(LocalDate fecha) {
        return pagoRepository.findByEstadoAndFechaPagoBetween(
                EstadoPago.APROBADO, fecha.atStartOfDay(), fecha.atTime(LocalTime.MAX));
    }

    private BigDecimal sumar(List<Pago> pagos) {
        BigDecimal total = BigDecimal.ZERO;
        for (Pago pago : pagos) {
            if (pago.getMonto() != null) {
                total = total.add(pago.getMonto());
            }
        }
        return total;
    }

    // ((actual - anterior) / anterior) * 100, con 1 decimal
    private Double variacion(BigDecimal actual, BigDecimal anterior) {
        if (anterior.compareTo(BigDecimal.ZERO) == 0) {
            return null;   // no hay con que comparar
        }
        return actual.subtract(anterior)
                .multiply(BigDecimal.valueOf(100))
                .divide(anterior, 1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private void sumarPlatos(Turno turno, Map<Long, PlatoVendido> ventas) {
        if (turno.getPlatos() == null) {
            return;
        }
        for (Plato plato : turno.getPlatos()) {
            PlatoVendido vendido = ventas.computeIfAbsent(plato.getId(), id -> {
                PlatoVendido nuevo = new PlatoVendido();
                nuevo.setPlatoId(id);
                nuevo.setNombre(plato.getNombre());
                return nuevo;
            });
            vendido.setCantidad(vendido.getCantidad() + 1);
            if (plato.getPrecio() != null) {
                vendido.setTotal(vendido.getTotal().add(plato.getPrecio()));
            }
        }
    }

    // Ordena de mayor a menor por cantidad (y por total si empatan)
    private List<PlatoVendido> masVendidos(Map<Long, PlatoVendido> ventas) {
        List<PlatoVendido> lista = new ArrayList<>(ventas.values());
        lista.sort(Comparator.comparingInt(PlatoVendido::getCantidad)
                .thenComparing(PlatoVendido::getTotal)
                .reversed());
        return lista;
    }

    // "martes" -> "Martes"
    private String nombreDelDia(LocalDate fecha) {
        String nombre = fecha.getDayOfWeek().getDisplayName(TextStyle.FULL, ESPANOL);
        return nombre.substring(0, 1).toUpperCase() + nombre.substring(1);
    }
}
