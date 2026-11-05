package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.LoginUsuarioRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioActualizarRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioResponse;
import com.bocado.GestorRestaurante.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioService usuarioService;

    @PostMapping("/crearUsuario")
    public ResponseEntity<UsuarioResponse> crearUsuario(
            @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.crearUsuario(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> iniciarSesion(
            @Valid @RequestBody LoginUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.iniciarSesion(request));
    }

    @GetMapping("/listarUsuarios")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/obtenerUsuario/{id}")
    public ResponseEntity<UsuarioResponse> obtenerUsuarioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerUsuarioPorId(id));
    }

    @PutMapping("/actualizarUsuario/{id}")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioActualizarRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @DeleteMapping("/eliminarUsuario/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
