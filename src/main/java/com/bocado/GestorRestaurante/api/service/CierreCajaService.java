package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.CierreCajaRequest;
import com.bocado.GestorRestaurante.api.dto.CierreCajaResponse;
import com.bocado.GestorRestaurante.api.dto.ReporteDiarioResponse;
import com.bocado.GestorRestaurante.api.model.CierreCaja;
import com.bocado.GestorRestaurante.api.repository.CierreCajaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Reglas del cierre de caja:
 *  1. No se puede cerrar un dia futuro.
 *  2. No se puede cerrar si hay mesas con consumo sin cobrar.
 *  3. Los totales los calcula el sistema; el encargado solo informa el efectivo que conto.
 *  4. Si el dia ya tiene un cierre, el nuevo es una CORRECCION:
 *     - el motivo es obligatorio
 *     - el cierre anterior NO se borra: queda como no vigente (auditoria)
 */
@Service
public class CierreCajaService {

    private final CierreCajaRepository cierreCajaRepository;
    private final ReporteService reporteService;

    public CierreCajaService(CierreCajaRepository cierreCajaRepository, ReporteService reporteService) {
        this.cierreCajaRepository = cierreCajaRepository;
        this.reporteService = reporteService;
    }

    // Historial del dia (el primero de la lista es el mas reciente)
    @Transactional(readOnly = true)
    public List<CierreCajaResponse> historial(LocalDate fecha) {
        return cierreCajaRepository.findByFechaOrderByFechaHoraCierreDesc(fecha)
                .stream()
                .map(this::aResponse)
                .toList();
    }

    @Transactional
    public CierreCajaResponse cerrar(CierreCajaRequest request) {
        LocalDate fecha = request.getFecha();

        // Regla 1
        if (fecha.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cerrar la caja de un dia futuro");
        }

        // Reutilizamos el reporte: asi el cierre y el reporte nunca dan distinto
        ReporteDiarioResponse reporte = reporteService.reporteDelDia(fecha);

        // Regla 2
        int pendientes = reporte.getPendientesDeCobro().size();
        if (pendientes > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede cerrar la caja: hay " + pendientes + " mesa(s) con consumo sin cobrar");
        }

        // Regla 4: si ya habia un cierre, esto es una correccion
        Optional<CierreCaja> anterior = cierreCajaRepository.findByFechaAndVigenteTrue(fecha);
        if (anterior.isPresent()) {
            String motivo = request.getMotivoCorreccion();
            if (motivo == null || motivo.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Para corregir un cierre hay que indicar el motivo");
            }
            CierreCaja viejo = anterior.get();
            viejo.setVigente(false);           // no se borra: queda en el historial
            cierreCajaRepository.save(viejo);
        }

        // Regla 3: los totales salen del sistema
        BigDecimal efectivoSistema = reporte.getRecaudacionPorMetodo().getOrDefault("EFECTIVO", BigDecimal.ZERO);

        CierreCaja cierre = new CierreCaja();
        cierre.setFecha(fecha);
        cierre.setTotalSistema(reporte.getRecaudacionTotal());
        cierre.setEfectivoSistema(efectivoSistema);
        cierre.setCantidadPagos(reporte.getCantidadPagos());
        cierre.setEfectivoContado(request.getEfectivoContado());
        cierre.setDiferencia(request.getEfectivoContado().subtract(efectivoSistema));
        cierre.setObservaciones(request.getObservaciones());
        cierre.setMotivoCorreccion(anterior.isPresent() ? request.getMotivoCorreccion().trim() : null);
        cierre.setCerradoPor(request.getCerradoPor());
        cierre.setFechaHoraCierre(LocalDateTime.now());
        cierre.setVigente(true);

        return aResponse(cierreCajaRepository.save(cierre));
    }

    // Convierte la entidad en DTO (no exponemos la entidad al front)
    private CierreCajaResponse aResponse(CierreCaja cierre) {
        CierreCajaResponse r = new CierreCajaResponse();
        r.setId(cierre.getId());
        r.setFecha(cierre.getFecha());
        r.setTotalSistema(cierre.getTotalSistema());
        r.setEfectivoSistema(cierre.getEfectivoSistema());
        r.setCantidadPagos(cierre.getCantidadPagos());
        r.setEfectivoContado(cierre.getEfectivoContado());
        r.setDiferencia(cierre.getDiferencia());
        r.setObservaciones(cierre.getObservaciones());
        r.setMotivoCorreccion(cierre.getMotivoCorreccion());
        r.setCerradoPor(cierre.getCerradoPor());
        r.setFechaHoraCierre(cierre.getFechaHoraCierre());
        r.setVigente(cierre.getVigente());
        return r;
    }
}
