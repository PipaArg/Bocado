package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.ClienteRequest;
import com.bocado.GestorRestaurante.api.dto.ClienteResponse;
import com.bocado.GestorRestaurante.api.service.ClienteService;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping("/crearCliente")
    public ResponseEntity<ClienteResponse> crearCliente(@RequestBody ClienteRequest request) {
        ClienteResponse response = clienteService.crearCliente(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/listarClientes")
    public ResponseEntity<List<ClienteResponse>> listarClientes() {
        List<ClienteResponse> response = clienteService.listarClientes();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/obtenerCliente/{id}")
    public ResponseEntity<ClienteResponse> obtenerClientePorId(@PathVariable Long id) {
        ClienteResponse response = clienteService.obtenerClientePorId(id);
        return ResponseEntity.ok(response);
    }
}
