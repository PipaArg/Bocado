package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoriaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String emoji;
}
