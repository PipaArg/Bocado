package com.bocado.GestorRestaurante.api.exception;

/*
 * Se lanza cuando la operacion pedida no se puede realizar
 * en el estado actual (ej: cobrar un turno sin platos).
 * El ManejadorGlobalErrores la transforma en un HTTP 400.
 */
public class OperacionInvalidaException extends RuntimeException {

    public OperacionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
