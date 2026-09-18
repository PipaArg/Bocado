package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.service.TurnoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoService turnoService;

    public TurnoController(TurnoService turnoService) {
        this.turnoService = turnoService;
    }

    @PostMapping("/crearTurno")
    public ResponseEntity<TurnoResponse> crearTurno( @RequestBody TurnoRequest request) {
        TurnoResponse response = turnoService.crearTurno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/listarTurnos")
    public ResponseEntity<List<TurnoResponse>> listarTurnos() {
        List<TurnoResponse> response = turnoService.listarTurnos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/obtenerTurno/{id}")
    public ResponseEntity<TurnoResponse> obtenerTurnoPorId(@PathVariable Long id) {
        TurnoResponse response = turnoService.obtenerTurnoPorId(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/actualizarTurno/{id}")
    public ResponseEntity<TurnoResponse> actualizarTurno(@PathVariable Long id, @RequestBody TurnoRequest request) {
        TurnoResponse response = turnoService.actualizarTurno(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cambiarEstado/{id}")
    public ResponseEntity<TurnoResponse> cambiarEstado(@PathVariable Long id, @RequestParam EstadoTurno estado) {
        TurnoResponse response = turnoService.cambiarEstado(id, estado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/eliminarTurno/{id}")
    public ResponseEntity<Void> eliminarTurno(@PathVariable Long id) {
        turnoService.eliminarTurno(id);
        return ResponseEntity.noContent().build();
    }


}
