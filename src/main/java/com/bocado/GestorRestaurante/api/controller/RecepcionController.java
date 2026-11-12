package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.SalonMesaResponse;
import com.bocado.GestorRestaurante.api.dto.TurnoRecepcionResponse;
import com.bocado.GestorRestaurante.api.service.RecepcionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/*
 * Endpoints de RECEPCION (sin montos).
 *
 *  GET /api/recepcion/turnos?fecha=2026-11-11        turnos del dia (sin fecha = hoy)
 *  GET /api/recepcion/salon                          mesas activas: libres y ocupadas
 *  PUT /api/recepcion/turnos/{turnoId}/mesa/{mesaId} sentar al cliente en una mesa
 *  PUT /api/recepcion/turnos/{turnoId}/liberar       el cliente se fue (cuenta pagada)
 */
@RestController
@RequestMapping("/api/recepcion")
public class RecepcionController {

    private final RecepcionService recepcionService;

    public RecepcionController(RecepcionService recepcionService) {
        this.recepcionService = recepcionService;
    }

    @GetMapping("/turnos")
    public ResponseEntity<List<TurnoRecepcionResponse>> turnosDelDia(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        if (fecha == null) {
            fecha = LocalDate.now();
        }
        return ResponseEntity.ok(recepcionService.turnosDelDia(fecha));
    }

    @GetMapping("/salon")
    public ResponseEntity<List<SalonMesaResponse>> salon() {
        return ResponseEntity.ok(recepcionService.salon());
    }

    @PutMapping("/turnos/{turnoId}/mesa/{mesaId}")
    public ResponseEntity<TurnoRecepcionResponse> asignarMesa(@PathVariable Long turnoId, @PathVariable Long mesaId) {
        return ResponseEntity.ok(recepcionService.asignarMesa(turnoId, mesaId));
    }

    @PutMapping("/turnos/{turnoId}/liberar")
    public ResponseEntity<TurnoRecepcionResponse> liberarMesa(@PathVariable Long turnoId) {
        return ResponseEntity.ok(recepcionService.liberarMesa(turnoId));
    }
}
