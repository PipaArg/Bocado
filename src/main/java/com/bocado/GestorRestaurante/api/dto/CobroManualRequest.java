package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.MetodoPago;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/*
 * Datos para registrar un cobro hecho en la mesa (efectivo o tarjeta con terminal).
 * Lo usa la app del mozo, que puede enviarlo mas tarde si estaba sin conexion.
 */
@Data
public class CobroManualRequest {

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodo;

    // Momento real del cobro. Opcional: si no viene (o es futuro) se usa la hora actual del servidor.
    private LocalDateTime cobradoEn;
}
