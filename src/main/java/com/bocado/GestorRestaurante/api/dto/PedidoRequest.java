package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/*
 * Pedido COMPLETO de una mesa: es el estado final que debe quedar en el turno.
 * Una lista vacia deja el turno sin platos.
 */
@Data
public class PedidoRequest {

    @NotNull(message = "La lista de items es obligatoria (puede ir vacia)")
    @Size(max = 100, message = "El pedido no puede tener mas de 100 lineas")
    @Valid
    private List<ItemPedidoRequest> items;
}
