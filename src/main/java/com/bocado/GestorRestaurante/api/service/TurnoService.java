package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.PagoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.model.Cliente;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.model.Plato;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.ClienteRepository;
import com.bocado.GestorRestaurante.api.repository.PlatoRepository;
import com.bocado.GestorRestaurante.api.repository.TurnoRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TurnoService {
    private final TurnoRepository turnoRepository;
    private final ClienteRepository clienteRepository;
    private final PlatoRepository platoRepository;
    private final PagoService pagoService;

    public TurnoResponse crearTurno(TurnoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + request.getClienteId()));

        Turno turno = new Turno();
        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setCliente(cliente);
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

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + request.getClienteId()));

        turno.setFecha(request.getFecha());
        turno.setHora(request.getHora());
        turno.setCantidadComensales(request.getCantidadComensales());
        turno.setCliente(cliente);

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


    public TurnoResponse agregarPlato(Long turnoId, Long platoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con id: " + turnoId));
        Plato plato = platoRepository.findById(platoId)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado con id: " + platoId));

        turno.getPlatos().add(plato);
        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }


    public TurnoResponse asociarPago(Long turnoId, PagoRequest request) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado con id: " + turnoId));

        Pago pago = pagoService.crearPago(request);
        turno.setPago(pago);

        Turno turnoActualizado = turnoRepository.save(turno);
        return new TurnoResponse(turnoActualizado);
    }
}
