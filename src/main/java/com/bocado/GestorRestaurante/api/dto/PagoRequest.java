package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PagoRequest {
    @NotNull(message = "El monto es obligatorio")
    //después ver como hacemos con devoluciones o descuentos
    @DecimalMin(
            value = "0.00",
            message = "El monto debe ser mayor a cero"
    )
    private BigDecimal monto;
}
