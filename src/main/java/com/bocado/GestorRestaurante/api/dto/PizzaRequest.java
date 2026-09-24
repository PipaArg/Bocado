package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PizzaRequest extends PlatoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a cero")
    private BigDecimal precio;

    @NotBlank(message = "El tamaño es obligatorio")
    private String tamanio;

    @NotBlank(message = "El tipo de masa es obligatorio")
    private String tipoMasa;
}
