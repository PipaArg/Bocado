package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO con el reporte de UN dia para el encargado.
 * Es lo unico que viaja al front: no exponemos las entidades.
 */
@Data
public class ReporteDiarioResponse {

    private LocalDate fecha;

    // ---- Plata (solo la ve el encargado) ----
    private BigDecimal recaudacionTotal = BigDecimal.ZERO;
    private int cantidadPagos;
    private BigDecimal ticketPromedio = BigDecimal.ZERO;

    // Ejemplo: { "EFECTIVO": 20000, "TARJETA": 15000, "MERCADO_PAGO": 0 }
    private Map<String, BigDecimal> recaudacionPorMetodo = new LinkedHashMap<>();

    // ---- Movimiento del salon ----
    private int cantidadTurnos;

    // Ejemplo: { "PENDIENTE": 2, "CONFIRMADO": 5, "CANCELADO": 1 }
    private Map<String, Integer> turnosPorEstado = new LinkedHashMap<>();

    private int comensales;

    // Mesas que consumieron pero todavia no pagaron
    private List<PendienteCobro> pendientesDeCobro = new ArrayList<>();

    @Data
    public static class PendienteCobro {
        private Long turnoId;
        private String hora;
        private String cliente;
        private BigDecimal total;
    }
}
