package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Turno;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/*
 * Lo que ve RECEPCION de un turno.
 * A proposito NO incluye montos ni platos: la recepcionista no maneja plata.
 * Solo sabe si la cuenta ya esta pagada (para poder liberar la mesa).
 */
@Data
public class TurnoRecepcionResponse {

    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer cantidadComensales;
    private EstadoTurno estado;
    private String cliente;
    private Long mesaId;
    private Integer mesaNumero;
    private boolean pagado;

    public TurnoRecepcionResponse(Turno turno) {
        this.id = turno.getId();
        this.fecha = turno.getFecha();
        this.hora = turno.getHora();
        this.cantidadComensales = turno.getCantidadComensales();
        this.estado = turno.getEstado();

        if (turno.getCliente() != null) {
            this.cliente = turno.getCliente().getNombre() + " " + turno.getCliente().getApellido();
        }

        if (turno.getMesa() != null) {
            this.mesaId = turno.getMesa().getId();
            this.mesaNumero = turno.getMesa().getNumero();
        }

        this.pagado = turno.getPago() != null && turno.getPago().getEstado() == EstadoPago.APROBADO;
    }
}
