package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Ventas de los ultimos 7 dias (estilo grafico de barras).
 * Todo se cuenta por el dia en que se COBRO, igual que el reporte diario.
 */
@Data
public class ReporteSemanalResponse {

    private LocalDate desde;
    private LocalDate hasta;
    private BigDecimal totalSemana = BigDecimal.ZERO;

    // Una entrada por dia, del mas viejo al mas nuevo
    private List<DiaVenta> dias = new ArrayList<>();

    // Platos mas vendidos de toda la semana (de mayor a menor)
    private List<PlatoVendido> rankingPlatos = new ArrayList<>();

    @Data
    public static class DiaVenta {
        private LocalDate fecha;
        private String nombreDia;              // "Martes"
        private BigDecimal recaudacion = BigDecimal.ZERO;
        private int cantidadPagos;
        // % contra el mismo dia de la semana anterior (null si no hay con que comparar)
        private Double variacion;
        private PlatoVendido platoTop;        // null si ese dia no se vendio nada
    }

    @Data
    public static class PlatoVendido {
        private Long platoId;
        private String nombre;
        private int cantidad;
        private BigDecimal total = BigDecimal.ZERO;
    }
}
