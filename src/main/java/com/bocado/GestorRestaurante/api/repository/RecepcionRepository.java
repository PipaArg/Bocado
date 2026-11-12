package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.model.Mesa;
import com.bocado.GestorRestaurante.api.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/*
 * Consultas que necesita RECEPCION.
 * Va en su propio repository para no tocar TurnoRepository ni MesaRepository.
 */
public interface RecepcionRepository extends JpaRepository<Turno, Long> {

    // Turnos de un dia, ordenados por hora
    @Query("select t from Turno t where t.fecha = :fecha order by t.hora")
    List<Turno> turnosDelDia(@Param("fecha") LocalDate fecha);

    // Turnos que estan ocupando una mesa (tienen mesa y no terminaron)
    @Query("select t from Turno t where t.mesa is not null and t.estado not in :cerrados")
    List<Turno> turnosEnMesa(@Param("cerrados") List<EstadoTurno> cerrados);

    // Mesas habilitadas, ordenadas por numero
    @Query("select m from Mesa m where m.activa = true order by m.numero")
    List<Mesa> mesasActivas();

    // Una mesa, solo si esta habilitada
    @Query("select m from Mesa m where m.id = :id and m.activa = true")
    Optional<Mesa> buscarMesaActiva(@Param("id") Long id);
}
