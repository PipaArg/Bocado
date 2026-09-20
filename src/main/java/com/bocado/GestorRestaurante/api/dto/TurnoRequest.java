package com.bocado.GestorRestaurante.api.dto;



import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TurnoRequest {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @NotNull(message = "La cantidad de comensales es obligatoria")
    @Min(value = 1, message = "Debe haber al menos un comensal")
    private Integer cantidadComensales;

    @NotNull(message = "El cliente es obligatorio")
    @Positive(message = "El ID del cliente debe ser positivo")
    private Long clienteId;
}
