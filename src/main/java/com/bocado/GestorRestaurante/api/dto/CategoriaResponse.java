package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.Categoria;
import lombok.Data;

@Data
public class CategoriaResponse {
    private Long id;
    private String nombre;
    private String emoji;

    public CategoriaResponse(Categoria categoria) {
        this.id = categoria.getId();
        this.nombre = categoria.getNombre();
        this.emoji = categoria.getEmoji();
    }
}
