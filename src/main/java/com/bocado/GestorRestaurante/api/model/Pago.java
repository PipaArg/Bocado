package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pagos")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    private EstadoPago estado;

    private LocalDateTime fechaCreacion;

    // Id del pago en Mercado Pago. Se completa cuando MP nos avisa por webhook.
    private String mercadoPagoId;

    // Momento en que se cobro (en pagos manuales, la hora real que informa el mozo).
    private LocalDateTime fechaPago;

    // Como se pago: por Mercado Pago (QR), efectivo o tarjeta con terminal.
    @Enumerated(EnumType.STRING)
    private MetodoPago metodo;

    // Id de la preferencia (link de pago) creada en Mercado Pago.
    private String preferenciaId;

    // URL a la que se redirige al cliente para pagar en Mercado Pago.
    @Column(length = 500)
    private String initPoint;
}
