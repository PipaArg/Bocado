package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PizzaRequest {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String tamanio;
    private String tipoMasa;
}
