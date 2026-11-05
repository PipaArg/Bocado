package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "usuarios", uniqueConstraints = {
        @UniqueConstraint(name = "uk_usuarios_usuario", columnNames = "usuario")
})
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String usuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(name = "clave_hash", nullable = false)
    private String claveHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NivelUsuario nivel;

    @Column(nullable = false)
    private boolean activo = true;
}
