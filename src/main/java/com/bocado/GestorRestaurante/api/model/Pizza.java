package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@DiscriminatorValue("PIZZA")
@Data
@EqualsAndHashCode(callSuper = true)
public class Pizza extends Plato {

    private String tamanio;
    private String tipoMasa;

    @Override
    public Map<String, Object> atributosEspecificos() {
        Map<String, Object> atributos = new LinkedHashMap<>();
        atributos.put("tamanio", tamanio);
        atributos.put("tipoMasa", tipoMasa);
        return atributos;
    }
}
