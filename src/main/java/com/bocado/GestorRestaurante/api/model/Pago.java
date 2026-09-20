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

    // Se completa mas adelante cuando se integre MercadoPago como checkout.
    private String mercadoPagoId;
}
