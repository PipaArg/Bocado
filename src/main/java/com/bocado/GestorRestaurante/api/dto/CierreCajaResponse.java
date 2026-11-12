package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lo que devuelve la API sobre un cierre de caja.
 */
@Data
public class CierreCajaResponse {
    private Long id;
    private LocalDate fecha;
    private BigDecimal totalSistema;
    private BigDecimal efectivoSistema;
    private Integer cantidadPagos;
    private BigDecimal efectivoContado;
    private BigDecimal diferencia;
    private String observaciones;
    private String motivoCorreccion;
    private String cerradoPor;
    private LocalDateTime fechaHoraCierre;
    private Boolean vigente;
}
