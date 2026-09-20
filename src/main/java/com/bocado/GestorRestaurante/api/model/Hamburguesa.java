package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.LinkedHashMap;
import java.util.Map;

// nombre, descripcion y precio se heredan de Plato.

@Entity
@DiscriminatorValue("HAMBURGUESA")
@Data
@EqualsAndHashCode(callSuper = true)
public class Hamburguesa extends Plato {

    private Boolean conQueso;
    private String tipoPan;

    @Override
    public Map<String, Object> atributosEspecificos() {
        Map<String, Object> atributos = new LinkedHashMap<>();
        atributos.put("conQueso", conQueso);
        atributos.put("tipoPan", tipoPan);
        return atributos;
    }
}
