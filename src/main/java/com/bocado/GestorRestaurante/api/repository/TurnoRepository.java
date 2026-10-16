package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.Turno;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TurnoRepository extends JpaRepository<Turno, Long> {

    // Busca el turno al que pertenece un pago (lo usamos cuando Mercado Pago nos
    // avisa).
    Optional<Turno> findByPagoId(Long pagoId);

    // Todos los turnos de un dia (para el reporte del encargado).
    List<Turno> findByFecha(LocalDate fecha);

    // Lectura con bloqueo: si la app del mozo reintenta un cobro, se procesan de a
    // uno.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Turno t where t.id = :id")
    Optional<Turno> buscarParaActualizar(@Param("id") Long id);
}
