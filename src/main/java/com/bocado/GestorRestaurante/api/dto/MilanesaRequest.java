package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class MilanesaRequest extends PlatoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a cero")
    private BigDecimal precio;

    @NotBlank(message = "El tipo de carne es obligatorio")
    private String tipoCarne;

    @NotBlank(message = "La guarnición es obligatoria")
    private String guarnicion;
}
