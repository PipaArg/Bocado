package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.CierreCajaRequest;
import com.bocado.GestorRestaurante.api.dto.CierreCajaResponse;
import com.bocado.GestorRestaurante.api.service.CierreCajaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Cierre de caja del ENCARGADO.
 *
 *  GET  /api/caja/cierres?fecha=2026-11-11  -> historial del dia (lista vacia si no se cerro)
 *  POST /api/caja/cierres                   -> cierra la caja, o la corrige si ya estaba cerrada
 */
@RestController
@RequestMapping("/api/caja")
public class CierreCajaController {

    private final CierreCajaService cierreCajaService;

    public CierreCajaController(CierreCajaService cierreCajaService) {
        this.cierreCajaService = cierreCajaService;
    }

    @GetMapping("/cierres")
    public ResponseEntity<List<CierreCajaResponse>> historial(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(cierreCajaService.historial(fecha));
    }

    @PostMapping("/cierres")
    public ResponseEntity<CierreCajaResponse> cerrarCaja(@Valid @RequestBody CierreCajaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cierreCajaService.cerrar(request));
    }
}
