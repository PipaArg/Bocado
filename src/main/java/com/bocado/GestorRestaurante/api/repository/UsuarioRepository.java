package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuarioIgnoreCase(String usuario);

    boolean existsByUsuarioIgnoreCase(String usuario);

    boolean existsByUsuarioIgnoreCaseAndIdNot(String usuario, Long id);
}
