package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> { }
