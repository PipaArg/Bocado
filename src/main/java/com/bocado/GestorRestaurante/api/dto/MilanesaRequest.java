package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MilanesaRequest extends PlatoRequest {

    @NotBlank(message = "El tipo de carne es obligatorio")
    private String tipoCarne;

    private String guarnicion;
}