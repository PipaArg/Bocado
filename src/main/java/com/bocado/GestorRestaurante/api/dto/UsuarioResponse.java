package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.NivelUsuario;
import com.bocado.GestorRestaurante.api.model.Usuario;
import lombok.Getter;

@Getter
public class UsuarioResponse {
    private final Long id;
    private final String usuario;
    private final String nombre;
    private final String apellido;
    private final NivelUsuario nivel;
    private final boolean activo;

    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.usuario = usuario.getUsuario();
        this.nombre = usuario.getNombre();
        this.apellido = usuario.getApellido();
        this.nivel = usuario.getNivel();
        this.activo = usuario.isActivo();
    }
}
