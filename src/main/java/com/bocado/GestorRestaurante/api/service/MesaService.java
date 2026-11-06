package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.MesaRequest;
import com.bocado.GestorRestaurante.api.dto.MesaResponse;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Mesa;
import com.bocado.GestorRestaurante.api.repository.MesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {
    private final MesaRepository mesaRepository;

    public MesaResponse crearMesa(MesaRequest request) {
        validarNumeroDisponible(request.getNumero(), null);
        Mesa mesa = new Mesa();
        mesa.setNumero(request.getNumero());
        mesa.setCapacidad(request.getCapacidad());
        mesa.setActiva(true);
        return new MesaResponse(mesaRepository.save(mesa));
    }

    public List<MesaResponse> listarMesas() {
        return mesaRepository.findAll().stream()
                .map(MesaResponse::new)
                .toList();
    }

    public MesaResponse actualizarMesa(Long id, MesaRequest request) {
        Mesa mesa = buscarMesa(id);
        validarNumeroDisponible(request.getNumero(), id);
        mesa.setNumero(request.getNumero());
        mesa.setCapacidad(request.getCapacidad());
        return new MesaResponse(mesaRepository.save(mesa));
    }

    public MesaResponse cambiarActiva(Long id, boolean activa) {
        Mesa mesa = buscarMesa(id);
        mesa.setActiva(activa);
        return new MesaResponse(mesaRepository.save(mesa));
    }

    public void eliminarMesa(Long id) {
        mesaRepository.delete(buscarMesa(id));
    }

    private Mesa buscarMesa(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Mesa no encontrada con id: " + id));
    }

    private void validarNumeroDisponible(Integer numero, Long id) {
        boolean existe = id == null
                ? mesaRepository.existsByNumero(numero)
                : mesaRepository.existsByNumeroAndIdNot(numero, id);
        if (existe) {
            throw new RecursoDuplicadoException("Ya existe una mesa con el número: " + numero);
        }
    }
}
