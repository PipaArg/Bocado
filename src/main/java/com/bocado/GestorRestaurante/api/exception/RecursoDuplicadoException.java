package com.bocado.GestorRestaurante.api.exception;

public class RecursoDuplicadoException extends RuntimeException {

    public RecursoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}