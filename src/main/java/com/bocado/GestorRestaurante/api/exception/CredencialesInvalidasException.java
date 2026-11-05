package com.bocado.GestorRestaurante.api.exception;

public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException() {
        super("Usuario o clave incorrectos");
    }
}
