package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.Plato;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatoRepository extends JpaRepository<Plato, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
