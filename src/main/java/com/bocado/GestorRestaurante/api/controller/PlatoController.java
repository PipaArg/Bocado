package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.HamburguesaRequest;
import com.bocado.GestorRestaurante.api.dto.MilanesaRequest;
import com.bocado.GestorRestaurante.api.dto.PizzaRequest;
import com.bocado.GestorRestaurante.api.dto.PlatoResponse;
import com.bocado.GestorRestaurante.api.service.PlatoService;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platos")
public class PlatoController {

    private final PlatoService platoService;

    public PlatoController(PlatoService platoService) {
        this.platoService = platoService;
    }

    @PostMapping("/hamburguesas")
    public ResponseEntity<PlatoResponse> crearHamburguesa(@RequestBody HamburguesaRequest request) {
        PlatoResponse response = platoService.crearHamburguesa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/pizzas")
    public ResponseEntity<PlatoResponse> crearPizza(@RequestBody PizzaRequest request) {
        PlatoResponse response = platoService.crearPizza(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/milanesas")
    public ResponseEntity<PlatoResponse> crearMilanesa(@RequestBody MilanesaRequest request) {
        PlatoResponse response = platoService.crearMilanesa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/listarPlatos")
    public ResponseEntity<List<PlatoResponse>> listarPlatos() {
        List<PlatoResponse> response = platoService.listarPlatos();
        return ResponseEntity.ok(response);
    }
}
