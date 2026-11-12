package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.ReporteSemanalResponse;
import com.bocado.GestorRestaurante.api.service.ReporteSemanalService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Ventas de los ultimos 7 dias para el ENCARGADO.
 *
 * Ejemplo:  GET /api/reportes/semana?hasta=2026-11-11
 * Devuelve del 05/11 al 11/11. Si no se manda fecha, usa hoy.
 */
@RestController
@RequestMapping("/api/reportes")
public class ReporteSemanalController {

    private final ReporteSemanalService reporteSemanalService;

    public ReporteSemanalController(ReporteSemanalService reporteSemanalService) {
        this.reporteSemanalService = reporteSemanalService;
    }

    @GetMapping("/semana")
    public ResponseEntity<ReporteSemanalResponse> reporteSemanal(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        if (hasta == null) {
            hasta = LocalDate.now();
        }
        return ResponseEntity.ok(reporteSemanalService.reporteSemanal(hasta));
    }
}
