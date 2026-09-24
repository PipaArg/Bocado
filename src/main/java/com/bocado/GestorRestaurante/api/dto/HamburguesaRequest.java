package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class HamburguesaRequest extends PlatoRequest {

    @NotNull(message = "Debe indicar si lleva queso")
    private Boolean conQueso;

    @NotBlank(message = "El tipo de pan es obligatorio")
    private String tipoPan;
}
