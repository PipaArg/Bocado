package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.CheckoutResponse;
import com.bocado.GestorRestaurante.api.dto.CobroManualRequest;
import com.bocado.GestorRestaurante.api.dto.PagoRequest;
import com.bocado.GestorRestaurante.api.dto.PagoResponse;
import com.bocado.GestorRestaurante.api.dto.PedidoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoRequest;
import com.bocado.GestorRestaurante.api.dto.TurnoResponse;
import com.bocado.GestorRestaurante.api.model.EstadoTurno;
import com.bocado.GestorRestaurante.api.service.TurnoService;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoService turnoService;

    public TurnoController(TurnoService turnoService) {
        this.turnoService = turnoService;
    }

    @PostMapping("/crearTurno")
    public ResponseEntity<TurnoResponse> crearTurno(
            @Valid @RequestBody TurnoRequest request) {
        TurnoResponse response = turnoService.crearTurno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/listarTurnos")
    public ResponseEntity<List<TurnoResponse>> listarTurnos() {
        List<TurnoResponse> response = turnoService.listarTurnos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/obtenerTurno/{id}")
    public ResponseEntity<TurnoResponse> obtenerTurnoPorId(@PathVariable Long id) {
        TurnoResponse response = turnoService.obtenerTurnoPorId(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/actualizarTurno/{id}")
    public ResponseEntity<TurnoResponse> actualizarTurno(@PathVariable Long id, @Valid @RequestBody TurnoRequest request) {
        TurnoResponse response = turnoService.actualizarTurno(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cambiarEstado/{id}")
    public ResponseEntity<TurnoResponse> cambiarEstado(@PathVariable Long id, @RequestParam EstadoTurno estado) {
        TurnoResponse response = turnoService.cambiarEstado(id, estado);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/eliminarTurno/{id}")
    public ResponseEntity<Void> eliminarTurno(@PathVariable Long id) {
        turnoService.eliminarTurno(id);
        return ResponseEntity.noContent().build();
    }

    // Relacion muchos a muchos: agrega un Plato pre-pedido a un Turno existente.
    @PostMapping("/{turnoId}/platos/{platoId}")
    public ResponseEntity<TurnoResponse> agregarPlato(@PathVariable Long turnoId, @PathVariable Long platoId) {
        TurnoResponse response = turnoService.agregarPlato(turnoId, platoId);
        return ResponseEntity.ok(response);
    }

    // Pedido de la mesa: reemplaza TODOS los platos del turno (agregar, quitar, cambiar cantidades). Idempotente.
    // Body: { "items": [ { "platoId": 1, "cantidad": 2 }, { "platoId": 4, "cantidad": 1 } ] }
    @PutMapping("/{turnoId}/platos")
    public ResponseEntity<TurnoResponse> reemplazarPlatos(
            @PathVariable Long turnoId,
            @Valid @RequestBody PedidoRequest request) {
        return ResponseEntity.ok(turnoService.reemplazarPlatos(turnoId, request));
    }

    // Relacion uno a uno: crea y asocia un Pago al Turno.
    @PostMapping("/{turnoId}/pago")
    public ResponseEntity<TurnoResponse> asociarPago(@PathVariable Long turnoId,@Valid @RequestBody PagoRequest request) {
        TurnoResponse response = turnoService.asociarPago(turnoId, request);
        return ResponseEntity.ok(response);
    }

    // Cerrar pago: calcula el total de los platos, genera el checkout de Mercado Pago y devuelve el link/QR.
    @PostMapping("/{turnoId}/cerrar-pago")
    public ResponseEntity<CheckoutResponse> cerrarPago(@PathVariable Long turnoId) {
        CheckoutResponse response = turnoService.cerrarPago(turnoId);
        return ResponseEntity.ok(response);
    }

    // Pagado en efectivo en la mesa: aprueba el pago, confirma el turno y envia el comprobante.
    @PostMapping("/{turnoId}/pago-efectivo")
    public ResponseEntity<PagoResponse> pagarEnEfectivo(@PathVariable Long turnoId) {
        PagoResponse response = turnoService.pagarEnEfectivo(turnoId);
        return ResponseEntity.ok(response);
    }

    /*
     * Cobro hecho en la mesa (EFECTIVO o TARJETA). Lo usa la app del mozo y es idempotente:
     * si el mismo cobro llega dos veces, la segunda devuelve el pago ya registrado.
     * Body: { "metodo": "EFECTIVO" | "TARJETA", "cobradoEn": "2026-10-05T21:15:00" (opcional) }
     */
    @PostMapping("/{turnoId}/pago-manual")
    public ResponseEntity<PagoResponse> registrarCobroManual(
            @PathVariable Long turnoId,
            @Valid @RequestBody CobroManualRequest request) {
        PagoResponse response = turnoService.registrarCobroManual(turnoId, request);
        return ResponseEntity.ok(response);
    }

}
