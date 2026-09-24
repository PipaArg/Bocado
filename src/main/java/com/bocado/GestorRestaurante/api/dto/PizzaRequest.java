package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PizzaRequest extends PlatoRequest {

    @NotBlank(message = "El tamaño es obligatorio")
    private String tamanio;

    @NotBlank(message = "El tipo de masa es obligatorio")
    private String tipoMasa;
}