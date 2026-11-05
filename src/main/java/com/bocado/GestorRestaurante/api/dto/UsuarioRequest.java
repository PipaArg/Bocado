package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.NivelUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(max = 50, message = "El nombre de usuario no puede superar 50 caracteres")
    private String usuario;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar 100 caracteres")
    private String apellido;

    @NotBlank(message = "La clave es obligatoria")
    @Size(min = 8, max = 72, message = "La clave debe tener entre 8 y 72 caracteres")
    private String clave;

    @NotNull(message = "El nivel del usuario es obligatorio")
    private NivelUsuario nivel;
}
