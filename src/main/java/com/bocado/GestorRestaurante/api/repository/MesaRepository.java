package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    boolean existsByNumero(Integer numero);

    boolean existsByNumeroAndIdNot(Integer numero, Long id);

    boolean existsByMozoId(Long mozoId);
}
