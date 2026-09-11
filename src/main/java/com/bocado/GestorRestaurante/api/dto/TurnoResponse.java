package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Turno;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TurnoResponse {
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer cantidadComensales;
    private String nombreCliente;
    private String email;
    private EstadoTurno estado;

    public TurnoResponse(Turno turno) {
        this.id = turno.getId();
        this.fecha = turno.getFecha();
        this.hora = turno.getHora();
        this.cantidadComensales = turno.getCantidadComensales();
        this.nombreCliente = turno.getNombreCliente();
        this.email = turno.getEmail();
        this.estado = turno.getEstado();
    }
}