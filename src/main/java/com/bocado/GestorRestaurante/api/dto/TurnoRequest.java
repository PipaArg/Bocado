package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TurnoRequest {
    private LocalDate fecha;
    private LocalTime hora;
    private Integer cantidadComensales;
    private Long clienteId;
}
