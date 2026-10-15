package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.ReporteDiarioResponse;
import com.bocado.GestorRestaurante.api.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Endpoints de reportes para el ENCARGADO.
 * El controller no calcula nada: recibe el pedido y le pasa la tarea al Service.
 *
 * Ejemplo:  GET /api/reportes/dia?fecha=2026-10-15
 * Si no se manda fecha, usa el dia de hoy.
 */
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/dia")
    public ResponseEntity<ReporteDiarioResponse> reporteDelDia(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        if (fecha == null) {
            fecha = LocalDate.now();
        }
        return ResponseEntity.ok(reporteService.reporteDelDia(fecha));
    }
}
