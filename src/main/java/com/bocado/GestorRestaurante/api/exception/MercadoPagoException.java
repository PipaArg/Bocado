package com.bocado.GestorRestaurante.api.exception;

/*
 * Se lanza cuando falla la comunicacion con Mercado Pago
 * (token faltante o invalido, error de la API, sin conexion, etc.).
 * El ManejadorGlobalErrores la transforma en un HTTP 502.
 */
public class MercadoPagoException extends RuntimeException {

    public MercadoPagoException(String mensaje) {
        super(mensaje);
    }
}
