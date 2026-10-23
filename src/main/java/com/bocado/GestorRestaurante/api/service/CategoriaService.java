package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.CategoriaRequest;
import com.bocado.GestorRestaurante.api.dto.CategoriaResponse;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Categoria;
import com.bocado.GestorRestaurante.api.repository.CategoriaRepository;
import com.bocado.GestorRestaurante.api.repository.PlatoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final PlatoRepository platoRepository;

    public CategoriaResponse crearCategoria(CategoriaRequest request) {
        validarNombreDisponible(request.getNombre(), null);

        Categoria categoria = new Categoria();
        categoria.setNombre(request.getNombre());
        categoria.setEmoji(request.getEmoji());
        return new CategoriaResponse(categoriaRepository.save(categoria));
    }

    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAll().stream()
                .map(CategoriaResponse::new)
                .toList();
    }

    public CategoriaResponse obtenerCategoriaPorId(Long id) {
        return new CategoriaResponse(buscarCategoria(id));
    }

    public CategoriaResponse actualizarCategoria(Long id, CategoriaRequest request) {
        Categoria categoria = buscarCategoria(id);
        validarNombreDisponible(request.getNombre(), id);
        categoria.setNombre(request.getNombre());
        categoria.setEmoji(request.getEmoji());
        return new CategoriaResponse(categoriaRepository.save(categoria));
    }

    public void eliminarCategoria(Long id) {
        Categoria categoria = buscarCategoria(id);
        if (platoRepository.existsByCategoria_Id(id)) {
            throw new RecursoDuplicadoException(
                    "No se puede eliminar la categoria porque tiene platos asignados");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Categoria no encontrada con id: " + id));
    }

    private void validarNombreDisponible(String nombre, Long id) {
        boolean existe = id == null
                ? categoriaRepository.existsByNombreIgnoreCase(nombre)
                : categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id);
        if (existe) {
            throw new RecursoDuplicadoException(
                    "Ya existe una categoria con el nombre: " + nombre);
        }
    }
}
