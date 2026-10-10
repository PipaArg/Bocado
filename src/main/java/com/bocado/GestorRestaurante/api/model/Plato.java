package com.bocado.GestorRestaurante.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "platos")
@Data
@EqualsAndHashCode(exclude = "turnos")
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // No se deberia poder repetir el nombre de 2 platos
    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;
    //No puede ser 0 el precio
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @ManyToMany(mappedBy = "platos")
    @JsonIgnore
    private List<Turno> turnos;



}
