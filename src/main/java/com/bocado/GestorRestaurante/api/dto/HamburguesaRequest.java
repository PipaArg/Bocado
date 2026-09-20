package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HamburguesaRequest {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Boolean conQueso;
    private String tipoPan;
}
