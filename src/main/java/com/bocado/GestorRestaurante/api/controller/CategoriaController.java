package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.CategoriaRequest;
import com.bocado.GestorRestaurante.api.dto.CategoriaResponse;
import com.bocado.GestorRestaurante.api.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;

    @PostMapping("/crearCategoria")
    public ResponseEntity<CategoriaResponse> crearCategoria(
            @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriaService.crearCategoria(request));
    }

    @GetMapping("/listarCategorias")
    public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
        return ResponseEntity.ok(categoriaService.listarCategorias());
    }

    @GetMapping("/obtenerCategoria/{id}")
    public ResponseEntity<CategoriaResponse> obtenerCategoriaPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obtenerCategoriaPorId(id));
    }

    @PutMapping("/actualizarCategoria/{id}")
    public ResponseEntity<CategoriaResponse> actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.actualizarCategoria(id, request));
    }

    @DeleteMapping("/eliminarCategoria/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
