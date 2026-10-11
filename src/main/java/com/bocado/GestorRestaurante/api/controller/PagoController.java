package com.bocado.GestorRestaurante.api.controller;

import com.bocado.GestorRestaurante.api.dto.CheckoutResponse;
import com.bocado.GestorRestaurante.api.dto.PagoResponse;
import com.bocado.GestorRestaurante.api.service.PagoService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping("/obtenerPago/{id}")
    public ResponseEntity<PagoResponse> obtenerPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.obtenerPago(id));
    }

    // Genera el link de pago de Mercado Pago. El front redirige al cliente a "initPoint".
    @PostMapping("/{id}/checkout")
    public ResponseEntity<CheckoutResponse> generarCheckout(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.generarCheckout(id));
    }

    // Reenvia el recibo por mail al cliente de la reserva (el pago tiene que estar aprobado).
    @PostMapping("/{id}/reenviar-recibo")
    public ResponseEntity<Map<String, String>> reenviarRecibo(@PathVariable Long id) {
        String destino = pagoService.reenviarRecibo(id);
        return ResponseEntity.ok(Map.of("mensaje", "Se esta enviando el recibo a " + destino));
    }

    // Imagen PNG del QR de pago, para mostrar con <img src=".../api/pagos/{id}/qr">.
    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> obtenerQr(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.generarQr(id));
    }

    /*
     * WEBHOOK: lo llama Mercado Pago (no el front) cuando cambia el estado de un pago.
     *
     * Llega como POST con ?data.id=123&type=payment y un JSON con { "type": "payment", "data": { "id": "123" } }.
     * Siempre respondemos 200 para que MP no reintente notificaciones que no nos interesan.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestParam(name = "data.id", required = false) String dataIdParam,
            @RequestParam(name = "type", required = false) String typeParam,
            @RequestParam(name = "topic", required = false) String topicParam,
            @RequestParam(name = "id", required = false) String idParam,
            @RequestBody(required = false) Map<String, Object> body) {

        String tipo = typeParam != null ? typeParam : topicParam;
        String paymentId = dataIdParam;

        if (body != null) {
            if (tipo == null && body.get("type") != null) {
                tipo = String.valueOf(body.get("type"));
            }
            if (paymentId == null && body.get("data") instanceof Map<?, ?> data && data.get("id") != null) {
                paymentId = String.valueOf(data.get("id"));
            }
        }
        if (paymentId == null) {
            paymentId = idParam; // formato viejo: ?topic=payment&id=123
        }

        log.info("Webhook de Mercado Pago recibido: tipo={}, id={}", tipo, paymentId);

        if ("payment".equals(tipo) && paymentId != null) {
            pagoService.procesarNotificacionPago(paymentId);
        }
        return ResponseEntity.ok().build();
    }
}
