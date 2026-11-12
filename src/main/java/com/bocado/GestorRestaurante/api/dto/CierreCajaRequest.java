package com.bocado.GestorRestaurante.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Lo que manda el encargado para cerrar (o corregir) la caja.
 *
 * Primer cierre del dia:
 * { "fecha": "2026-11-11", "efectivoContado": 18500, "observaciones": "", "cerradoPor": "Admin" }
 *
 * Correccion (ya habia un cierre ese dia): motivoCorreccion es obligatorio
 * { "fecha": "2026-11-11", "efectivoContado": 18000, "motivoCorreccion": "Conte mal los billetes de 1000", "cerradoPor": "Admin" }
 */
@Data
public class CierreCajaRequest {

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El efectivo contado es obligatorio")
    @DecimalMin(value = "0.00", message = "El efectivo contado no puede ser negativo")
    private BigDecimal efectivoContado;

    @Size(max = 500, message = "Las observaciones no pueden superar los 500 caracteres")
    private String observaciones;

    @Size(max = 500, message = "El motivo no puede superar los 500 caracteres")
    private String motivoCorreccion;

    @Size(max = 100, message = "El nombre de quien cierra no puede superar los 100 caracteres")
    private String cerradoPor;
}
