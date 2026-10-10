package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.PlatoRequest;
import com.bocado.GestorRestaurante.api.dto.PlatoResponse;
import com.bocado.GestorRestaurante.api.service.PlatoService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/platos")
public class PlatoController {

    private final PlatoService platoService;

    public PlatoController(PlatoService platoService) {
        this.platoService = platoService;
    }

    @PostMapping("/crearPlato")
    public ResponseEntity<PlatoResponse> crearPlato(
            @Valid @RequestBody PlatoRequest request) {
        PlatoResponse response = platoService.crearPlato(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/listarPlatos")
    public ResponseEntity<List<PlatoResponse>> listarPlatos() {
        List<PlatoResponse> response = platoService.listarPlatos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/obtenerPlato/{id}")
    public ResponseEntity<PlatoResponse> obtenerPlatoPorId(@PathVariable Long id) {
        PlatoResponse response = platoService.obtenerPlatoPorId(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/actualizarPlato/{id}")
    public ResponseEntity<PlatoResponse> actualizarPlato(@PathVariable Long id, @Valid @RequestBody PlatoRequest request) {
        PlatoResponse response = platoService.actualizarPlato(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/eliminarPlato/{id}")
    public ResponseEntity<Void> eliminarPlato(@PathVariable Long id) {
        platoService.eliminarPlato(id);
        return ResponseEntity.noContent().build();
    }
}
