package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoResponse {
    private Long id;
    private BigDecimal monto;
    private EstadoPago estado;
    private LocalDateTime fechaCreacion;

    public PagoResponse(Pago pago) {
        this.id = pago.getId();
        this.monto = pago.getMonto();
        this.estado = pago.getEstado();
        this.fechaCreacion = pago.getFechaCreacion();
    }
}
