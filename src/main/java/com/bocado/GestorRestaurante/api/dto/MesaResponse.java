package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.Mesa;
import lombok.Getter;

@Getter
public class MesaResponse {
    private final Long id;
    private final Integer numero;
    private final Integer capacidad;
    private final Long mozoId;
    private final String mozoNombre;
    private final boolean activa;

    public MesaResponse(Mesa mesa) {
        this.id = mesa.getId();
        this.numero = mesa.getNumero();
        this.capacidad = mesa.getCapacidad();
        this.mozoId = mesa.getMozo() == null ? null : mesa.getMozo().getId();
        this.mozoNombre = mesa.getMozo() == null
                ? null
                : mesa.getMozo().getNombre() + " " + mesa.getMozo().getApellido();
        this.activa = mesa.isActiva();
    }
}
