package com.bocado.GestorRestaurante.api.repository;

import com.bocado.GestorRestaurante.api.model.CierreCaja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CierreCajaRepository extends JpaRepository<CierreCaja, Long> {

    // El cierre actual de un dia (si existe)
    Optional<CierreCaja> findByFechaAndVigenteTrue(LocalDate fecha);

    // Historial completo de un dia, del mas nuevo al mas viejo
    List<CierreCaja> findByFechaOrderByFechaHoraCierreDesc(LocalDate fecha);
}
