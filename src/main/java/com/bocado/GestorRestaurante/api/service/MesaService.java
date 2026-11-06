package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.MesaRequest;
import com.bocado.GestorRestaurante.api.dto.MesaResponse;
import com.bocado.GestorRestaurante.api.exception.OperacionInvalidaException;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Mesa;
import com.bocado.GestorRestaurante.api.model.NivelUsuario;
import com.bocado.GestorRestaurante.api.model.Usuario;
import com.bocado.GestorRestaurante.api.repository.MesaRepository;
import com.bocado.GestorRestaurante.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {
    private final MesaRepository mesaRepository;
    private final UsuarioRepository usuarioRepository;

    public MesaResponse crearMesa(MesaRequest request) {
        validarNumeroDisponible(request.getNumero(), null);
        Mesa mesa = new Mesa();
        mesa.setNumero(request.getNumero());
        mesa.setCapacidad(request.getCapacidad());
        mesa.setMozo(buscarMozo(request.getMozoId(), null));
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
        mesa.setMozo(buscarMozo(request.getMozoId(), mesa));
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

    private Usuario buscarMozo(Long mozoId, Mesa mesa) {
        if (mozoId == null) {
            return null;
        }
        if (mesa != null && mesa.getMozo() != null
                && mesa.getMozo().getId().equals(mozoId)) {
            return mesa.getMozo();
        }

        Usuario mozo = usuarioRepository.findById(mozoId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Mozo no encontrado con id: " + mozoId));
        if (!mozo.isActivo() || mozo.getNivel() != NivelUsuario.MOZO) {
            throw new OperacionInvalidaException(
                    "Solo se pueden asignar mozos activos a una mesa");
        }
        return mozo;
    }
}
