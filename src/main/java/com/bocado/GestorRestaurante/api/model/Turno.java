package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "turnos")
public class Turno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    private LocalTime hora;

    private Integer cantidadComensales;

    private String nombreCliente;

    private String email;

    @Enumerated(EnumType.STRING)
    private EstadoTurno estado;
}