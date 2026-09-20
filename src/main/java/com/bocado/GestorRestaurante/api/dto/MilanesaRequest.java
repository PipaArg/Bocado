package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MilanesaRequest {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String tipoCarne;
    private String guarnicion;
}
