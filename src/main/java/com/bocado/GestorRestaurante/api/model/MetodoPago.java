package com.bocado.GestorRestaurante.api.model;

public enum MetodoPago {
    MERCADO_PAGO,   // QR / link: lo cobra Mercado Pago
    EFECTIVO,       // lo registra el mozo en la mesa
    TARJETA         // cobrada con la terminal del local; lo registra el mozo
}
