package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;

import org.springframework.stereotype.Service;
import java.util.List;
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

    public List<TurnoResponse> listarTurnos() {
        return turnoRepository.findAll()
                .stream()
                .map(TurnoResponse::new)
                .toList();
    }

    public TurnoResponse obtenerTurnoPorId(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con id: " + id));
        return new TurnoResponse(turno);
    }

    public TurnoResponse actualizarTurno(Long id, TurnoRequest request) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con id: " + id));

        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setNombreCliente(request.getNombreCliente());
        turno.setEmail(request.getEmail());

        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }

    public TurnoResponse cambiarEstado(Long id, EstadoTurno estado) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con id: " + id));

        turno.setEstado(estado);
        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }

    public void eliminarTurno(Long id) {
        if (!turnoRepository.existsById(id)) {
            throw new RuntimeException("Turno no encontrado con id: " + id);
        }
        turnoRepository.deleteById(id);
    }
}