package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClienteRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;


    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;


    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email es incorrecto")
    private String email;


    // Por ahora, el teléfono es opcional.
    private String telefono;

}