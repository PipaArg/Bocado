package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.bocado.GestorRestaurante.api.model.EstadoPago;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pago p where p.id = :id")
    Optional<Pago> buscarParaActualizar(@Param("id") Long id);

    // Pagos con un estado dado, cobrados entre dos momentos (reporte del dia).
    // Spring arma la consulta solo a partir del nombre del metodo.
    List<Pago> findByEstadoAndFechaPagoBetween(EstadoPago estado, LocalDateTime desde, LocalDateTime hasta);
}