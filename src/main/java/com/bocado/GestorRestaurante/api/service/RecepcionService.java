package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.SalonMesaResponse;
import com.bocado.GestorRestaurante.api.dto.TurnoRecepcionResponse;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Mesa;
import com.bocado.GestorRestaurante.api.model.Turno;
import com.bocado.GestorRestaurante.api.repository.RecepcionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*
 * Reglas de RECEPCION:
 *
 * Asignar mesa (sentar al cliente):
 *   1. El turno no puede estar cancelado ni finalizado.
 *   2. La mesa tiene que existir y estar activa.
 *   3. La capacidad tiene que alcanzar para los comensales.
 *   4. La mesa no puede estar ocupada por otro turno.
 *   -> el turno pasa a EN_CURSO.
 *
 * Liberar mesa (el cliente se fue):
 *   5. El turno tiene que tener mesa.
 *   6. La cuenta tiene que estar pagada (no se libera una mesa sin cobrar).
 *   -> el turno pasa a FINALIZADO y la mesa queda libre.
 *
 * Una mesa esta OCUPADA si tiene un turno que no esta FINALIZADO ni CANCELADO.
 */
@Service
public class RecepcionService {

    private static final List<EstadoTurno> CERRADOS = List.of(EstadoTurno.FINALIZADO, EstadoTurno.CANCELADO);

    private final RecepcionRepository recepcionRepository;

    public RecepcionService(RecepcionRepository recepcionRepository) {
        this.recepcionRepository = recepcionRepository;
    }

    @Transactional(readOnly = true)
    public List<TurnoRecepcionResponse> turnosDelDia(LocalDate fecha) {
        return recepcionRepository.turnosDelDia(fecha)
                .stream()
                .map(TurnoRecepcionResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SalonMesaResponse> salon() {
        // mesaId -> turno que la ocupa
        Map<Long, Turno> ocupadas = new HashMap<>();
        for (Turno turno : recepcionRepository.turnosEnMesa(CERRADOS)) {
            ocupadas.put(turno.getMesa().getId(), turno);
        }

        List<SalonMesaResponse> salon = new ArrayList<>();
        for (Mesa mesa : recepcionRepository.mesasActivas()) {
            salon.add(new SalonMesaResponse(mesa, ocupadas.get(mesa.getId())));
        }
        return salon;
    }

    @Transactional
    public TurnoRecepcionResponse asignarMesa(Long turnoId, Long mesaId) {
        Turno turno = buscarTurno(turnoId);

        // Regla 1
        if (CERRADOS.contains(turno.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El turno " + turnoId + " esta " + turno.getEstado() + ": no se le puede asignar mesa");
        }

        // Regla 2
        Mesa mesa = recepcionRepository.buscarMesaActiva(mesaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Mesa no encontrada o inactiva con id: " + mesaId));

        // Regla 3
        if (mesa.getCapacidad() < turno.getCantidadComensales()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La mesa " + mesa.getNumero() + " es para " + mesa.getCapacidad()
                            + " personas y el turno es de " + turno.getCantidadComensales());
        }

        // Regla 4
        boolean ocupada = recepcionRepository.turnosEnMesa(CERRADOS).stream()
                .anyMatch(t -> t.getMesa().getId().equals(mesaId) && !t.getId().equals(turnoId));
        if (ocupada) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La mesa " + mesa.getNumero() + " esta ocupada");
        }

        turno.setMesa(mesa);
        turno.setEstado(EstadoTurno.EN_CURSO);
        return new TurnoRecepcionResponse(recepcionRepository.save(turno));
    }

    @Transactional
    public TurnoRecepcionResponse liberarMesa(Long turnoId) {
        Turno turno = buscarTurno(turnoId);

        // Regla 5
        if (turno.getMesa() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El turno " + turnoId + " no tiene mesa asignada");
        }

        // Regla 6
        boolean pagado = turno.getPago() != null && turno.getPago().getEstado() == EstadoPago.APROBADO;
        if (!pagado) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede liberar la mesa " + turno.getMesa().getNumero() + ": la cuenta todavia no esta pagada");
        }

        // La mesa queda guardada en el turno como historial; deja de estar ocupada por el estado.
        turno.setEstado(EstadoTurno.FINALIZADO);
        return new TurnoRecepcionResponse(recepcionRepository.save(turno));
    }

    private Turno buscarTurno(Long turnoId) {
        return recepcionRepository.findById(turnoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + turnoId));
    }
}
