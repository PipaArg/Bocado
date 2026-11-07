package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MesaRequest {
    @NotNull(message = "El número de mesa es obligatorio")
    @Positive(message = "El número de mesa debe ser mayor a 0")
    private Integer numero;

    @NotNull(message = "La capacidad es obligatoria")
    @Positive(message = "La capacidad debe ser mayor a 0")
    private Integer capacidad;

    @Positive(message = "El mozo asignado debe ser válido")
    private Long mozoId;
}
