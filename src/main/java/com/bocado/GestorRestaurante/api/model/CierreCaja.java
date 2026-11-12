package com.bocado.GestorRestaurante.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Cierre de caja de un dia.
 *
 * Un dia puede tener VARIOS cierres: si el encargado se equivoca, lo corrige
 * haciendo un cierre nuevo. El anterior NO se borra: queda con vigente = false
 * como historial de auditoria. Por dia hay un solo cierre vigente.
 */
@Data
@Entity
@Table(name = "cierres_caja")
public class CierreCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    // Lo que calcula el sistema a partir de los pagos aprobados del dia
    private BigDecimal totalSistema;
    private BigDecimal efectivoSistema;
    private Integer cantidadPagos;

    // Lo que carga el encargado despues de contar la caja
    private BigDecimal efectivoContado;

    // efectivoContado - efectivoSistema  (positivo = sobra, negativo = falta)
    private BigDecimal diferencia;

    @Column(length = 500)
    private String observaciones;

    // Obligatorio cuando el cierre corrige a uno anterior
    @Column(length = 500)
    private String motivoCorreccion;

    private String cerradoPor;

    private LocalDateTime fechaHoraCierre;

    // true = cierre actual del dia / false = reemplazado por una correccion
    @Column(nullable = false)
    private Boolean vigente;
}
