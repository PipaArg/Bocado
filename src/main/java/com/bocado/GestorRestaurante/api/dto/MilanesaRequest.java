package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
@Data
@EqualsAndHashCode(callSuper = true)
public class MilanesaRequest extends PlatoRequest {

    @NotBlank(message = "El tipo de carne es obligatorio")
    private String tipoCarne;

    @NotBlank(message = "La guarnición es obligatoria")
    private String guarnicion;
}