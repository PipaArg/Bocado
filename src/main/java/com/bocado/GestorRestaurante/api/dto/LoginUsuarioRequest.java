package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginUsuarioRequest {
    @NotBlank(message = "El nombre de usuario es obligatorio")
    private String usuario;

    @NotBlank(message = "La clave es obligatoria")
    private String clave;
}
