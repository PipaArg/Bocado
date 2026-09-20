package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@DiscriminatorValue("MILANESA")
@Data
@EqualsAndHashCode(callSuper = true)
public class Milanesa extends Plato {

    private String tipoCarne;
    private String guarnicion;

    @Override
    public Map<String, Object> atributosEspecificos() {
        Map<String, Object> atributos = new LinkedHashMap<>();
        atributos.put("tipoCarne", tipoCarne);
        atributos.put("guarnicion", guarnicion);
        return atributos;
    }
}
