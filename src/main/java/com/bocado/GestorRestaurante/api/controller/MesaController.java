package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.MesaRequest;
import com.bocado.GestorRestaurante.api.dto.MesaResponse;
import com.bocado.GestorRestaurante.api.service.MesaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService mesaService;

    @PostMapping("/crearMesa")
    public ResponseEntity<MesaResponse> crearMesa(@Valid @RequestBody MesaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.crearMesa(request));
    }

    @GetMapping("/listarMesas")
    public ResponseEntity<List<MesaResponse>> listarMesas() {
        return ResponseEntity.ok(mesaService.listarMesas());
    }

    @PutMapping("/actualizarMesa/{id}")
    public ResponseEntity<MesaResponse> actualizarMesa(
            @PathVariable Long id,
            @Valid @RequestBody MesaRequest request) {
        return ResponseEntity.ok(mesaService.actualizarMesa(id, request));
    }

    @PatchMapping("/desactivarMesa/{id}")
    public ResponseEntity<MesaResponse> desactivarMesa(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.cambiarActiva(id, false));
    }

    @PatchMapping("/activarMesa/{id}")
    public ResponseEntity<MesaResponse> activarMesa(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.cambiarActiva(id, true));
    }

    @DeleteMapping("/eliminarMesa/{id}")
    public ResponseEntity<Void> eliminarMesa(@PathVariable Long id) {
        mesaService.eliminarMesa(id);
        return ResponseEntity.noContent().build();
    }
}
