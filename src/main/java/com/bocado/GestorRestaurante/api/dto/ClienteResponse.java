package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.Cliente;
import lombok.Data;

@Data
public class ClienteResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;

    public ClienteResponse(Cliente cliente) {
        this.id = cliente.getId();
        this.nombre = cliente.getNombre();
        this.apellido = cliente.getApellido();
        this.email = cliente.getEmail();
        this.telefono = cliente.getTelefono();
    }
}
