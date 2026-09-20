package com.bocado.GestorRestaurante.api.exception;

/*
 * Creamos una excepción propia para identificar
 * cuando un recurso solicitado no existe. Para que sea amigable al usuario
 */

public class RecursoNoEncontradoException extends RuntimeException {

    // Recibimos el mensaje que explica qué recurso falta.
    public RecursoNoEncontradoException(String mensaje) {
        // Le pasamos el mensaje a RuntimeException.
        super(mensaje);
    }
}