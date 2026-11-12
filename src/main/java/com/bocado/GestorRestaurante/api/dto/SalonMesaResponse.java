package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.Mesa;
import com.bocado.GestorRestaurante.api.model.Turno;
import lombok.Data;

/*
 * Una mesa del salon, vista por RECEPCION.
 * Si esta ocupada, trae el turno que la ocupa (sin montos).
 */
@Data
public class SalonMesaResponse {

    private Long mesaId;
    private Integer numero;
    private Integer capacidad;
    private boolean ocupada;
    private TurnoRecepcionResponse turno;   // null si la mesa esta libre

    public SalonMesaResponse(Mesa mesa, Turno turnoEnMesa) {
        this.mesaId = mesa.getId();
        this.numero = mesa.getNumero();
        this.capacidad = mesa.getCapacidad();
        this.ocupada = turnoEnMesa != null;
        if (turnoEnMesa != null) {
            this.turno = new TurnoRecepcionResponse(turnoEnMesa);
        }
    }
}
