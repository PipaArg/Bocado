package com.bocado.GestorRestaurante.api.dto;

import lombok.Data;

@Data
public class ClienteRequest {
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
}
