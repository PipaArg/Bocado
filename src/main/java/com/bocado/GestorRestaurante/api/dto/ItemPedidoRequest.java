package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/*
 * Una linea del pedido: que plato y cuantas unidades.
 */
@Data
public class ItemPedidoRequest {

    @NotNull(message = "El id del plato es obligatorio")
    private Long platoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad minima es 1 (para quitar un plato, omitilo del pedido)")
    @Max(value = 50, message = "La cantidad maxima por plato es 50")
    private Integer cantidad;
}
