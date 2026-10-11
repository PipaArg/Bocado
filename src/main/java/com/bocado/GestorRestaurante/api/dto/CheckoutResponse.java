package com.bocado.GestorRestaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/*
 * Respuesta al generar el checkout de un pago.
 * - initPoint: URL de pago de Mercado Pago (es lo que codifica el QR).
 * - qrUrl: ruta del back que devuelve la imagen PNG del QR, lista para un <img src="...">.
 */
@Data
@AllArgsConstructor
public class CheckoutResponse {
    private Long pagoId;
    private BigDecimal monto;
    private String preferenciaId;
    private String initPoint;
    private String qrUrl;
}
