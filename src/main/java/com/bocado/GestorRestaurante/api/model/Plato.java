package com.bocado.GestorRestaurante.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "platos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_plato")
@Data
@EqualsAndHashCode(exclude = "turnos")
public abstract class Plato {

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

    // Nombre del tipo concreto, usado por PlatoResponse en lugar de instanceof.
    @Transient
    public String getTipo() {
        return getClass().getSimpleName();
    }

    // Cada subclase expone sus propios atributos especificos aca.
    // La clase base no conoce nada de hamburguesas, pizzas ni milanesas.
    @Transient
    public Map<String, Object> atributosEspecificos() {
        return new LinkedHashMap<>();
    }
}
