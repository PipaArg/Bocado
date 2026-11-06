package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "mesas", uniqueConstraints = {
        @UniqueConstraint(name = "uk_mesas_numero", columnNames = "numero")
})
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(nullable = false)
    private boolean activa = true;
}
