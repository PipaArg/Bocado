package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TurnoService {
    private final TurnoRepository turnoRepository;

    public TurnoResponse crearTurno(TurnoRequest request) {
        Turno turno = new Turno();
        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setNombreCliente(request.getNombreCliente());
        turno.setEmail(request.getEmail());
        turno.setEstado(EstadoTurno.PENDIENTE);

        Turno turnoGuardado = turnoRepository.save(turno);

        return new TurnoResponse(turnoGuardado);
    }
}