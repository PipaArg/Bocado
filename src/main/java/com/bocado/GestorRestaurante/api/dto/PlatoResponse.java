package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.Plato;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class PlatoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String tipo;
    private Map<String, Object> atributos;


    public PlatoResponse(Plato plato) {
        this.id = plato.getId();
        this.nombre = plato.getNombre();
        this.descripcion = plato.getDescripcion();
        this.precio = plato.getPrecio();
        this.tipo = plato.getTipo();
        this.atributos = plato.atributosEspecificos();
    }
}
