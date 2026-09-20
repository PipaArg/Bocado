package com.bocado.GestorRestaurante.api.dto;

import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Turno;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class TurnoResponse {
    private Long id;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer cantidadComensales;
    private EstadoTurno estado;
    private Long clienteId;
    private String clienteNombre;
    private List<PlatoResponse> platos;
    private PagoResponse pago;

    public TurnoResponse(Turno turno) {
        this.id = turno.getId();
        this.fecha = turno.getFecha();
        this.hora = turno.getHora();
        this.cantidadComensales = turno.getCantidadComensales();
        this.estado = turno.getEstado();

        if (turno.getCliente() != null) {
            this.clienteId = turno.getCliente().getId();
            this.clienteNombre = turno.getCliente().getNombre() + " " + turno.getCliente().getApellido();
        }

        if (turno.getPlatos() != null) {
            this.platos = turno.getPlatos().stream()
                    .map(PlatoResponse::new)
                    .collect(Collectors.toList());
        }

        if (turno.getPago() != null) {
            this.pago = new PagoResponse(turno.getPago());
        }
    }
}
