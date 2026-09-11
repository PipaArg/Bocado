package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.service.TurnoService;
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

        @PostMapping
        public ResponseEntity<TurnoResponse> crearTurno(TurnoRequest request) {
            TurnoResponse response = turnoService.crearTurno(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
    }


