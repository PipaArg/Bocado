package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.PlatoRequest;
import com.bocado.GestorRestaurante.api.dto.PlatoResponse;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Plato;
import com.bocado.GestorRestaurante.api.repository.PlatoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatoService {
    private final PlatoRepository platoRepository;

    public  PlatoResponse crearPlato(PlatoRequest request) {

        Plato plato = new Plato();
        plato.setNombre(request.getNombre());
        plato.setDescripcion(request.getDescripcion());
        plato.setPrecio(request.getPrecio());

        Plato platoGuardado = platoRepository.save(plato);

        return new PlatoResponse(platoGuardado);
    }

    public PlatoResponse obtenerPlatoPorId(Long id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("plato no encontrado con id: " + id));
        return new PlatoResponse(plato);
    }

    public PlatoResponse actualizarPlato(Long id, PlatoRequest request) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("plato no encontrado con id: " + id));

        plato.setPrecio(request.getPrecio());
        plato.setDescripcion(request.getDescripcion());
        plato.setNombre(request.getNombre());

        Plato platoActualizado = platoRepository.save(plato);
        return new PlatoResponse(platoActualizado);
    }

    public void eliminarPlato(Long id) {
        if (!platoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException(
                    "Plato no encontrado con id: " + id);
        }
        platoRepository.deleteById(id);
    }


    public List<PlatoResponse> listarPlatos() {
        return platoRepository.findAll()
                .stream()
                .map(PlatoResponse::new)
                .toList();
    }


    private void validarNombreDisponible(String nombre) {
        if (platoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe un plato con el nombre: " + nombre);
        }
    }
}