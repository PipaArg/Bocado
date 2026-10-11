package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.exception.MercadoPagoException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/*
 * Unica clase que "habla" con la API de Mercado Pago.
 * El resto del proyecto no sabe nada de HTTP ni de MP: solo usa estos dos metodos.
 *
 * Configuracion (variables de entorno, nunca se suben a git):
 *   MP_ACCESS_TOKEN        -> access token de la aplicacion de MP (credenciales de prueba)
 *   MP_NOTIFICATION_URL    -> URL publica HTTPS del back (ej: la de ngrok), sin barra final
 *   MP_BACK_URL            -> URL del front a la que vuelve el cliente (default: http://localhost:5173)
 */
@Slf4j
@Service
public class MercadoPagoService {

    private static final String API_URL = "https://api.mercadopago.com";
    private static final ParameterizedTypeReference<Map<String, Object>> TIPO_MAPA =
            new ParameterizedTypeReference<>() { };

    private final RestClient restClient = RestClient.builder().baseUrl(API_URL).build();

    @Value("${mercadopago.access-token:${MP_ACCESS_TOKEN:}}")
    private String accessToken;

    @Value("${mercadopago.notification-url:${MP_NOTIFICATION_URL:}}")
    private String notificationUrl;

    @Value("${mercadopago.back-url:${MP_BACK_URL:http://localhost:5173}}")
    private String backUrl;

    /** Datos que nos interesan de la preferencia creada en MP. */
    public record Preferencia(String id, String initPoint) { }

    /** Crea la preferencia (el "link de pago") en Mercado Pago. */
    public Preferencia crearPreferencia(Long pagoId, String titulo, BigDecimal monto) {
        validarToken();

        Map<String, Object> item = Map.of(
                "title", titulo,
                "quantity", 1,
                "unit_price", monto,
                "currency_id", "ARS"
        );

        Map<String, Object> cuerpo = new java.util.LinkedHashMap<>();
        cuerpo.put("items", List.of(item));
        // external_reference: nuestro id de Pago. MP lo devuelve en el pago y asi lo identificamos.
        cuerpo.put("external_reference", String.valueOf(pagoId));
        cuerpo.put("back_urls", Map.of(
                "success", backUrl,
                "failure", backUrl,
                "pending", backUrl
        ));

        if (notificationUrl != null && !notificationUrl.isBlank()) {
            cuerpo.put("notification_url", notificationUrl + "/api/pagos/webhook");
        } else {
            log.warn("MP_NOTIFICATION_URL no esta configurada: Mercado Pago no va a poder avisar el resultado del pago");
        }

        try {
            Map<String, Object> respuesta = restClient.post()
                    .uri("/checkout/preferences")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(cuerpo)
                    .retrieve()
                    .body(TIPO_MAPA);

            if (respuesta == null || respuesta.get("id") == null || respuesta.get("init_point") == null) {
                throw new MercadoPagoException("Mercado Pago devolvio una respuesta inesperada al crear la preferencia");
            }
            return new Preferencia(
                    String.valueOf(respuesta.get("id")),
                    String.valueOf(respuesta.get("init_point")));

        } catch (RestClientResponseException e) {
            throw new MercadoPagoException("Error de Mercado Pago al crear la preferencia ("
                    + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
        } catch (RestClientException e) {
            throw new MercadoPagoException("No se pudo conectar con Mercado Pago: " + e.getMessage());
        }
    }

    /**
     * Consulta un pago en Mercado Pago por su id.
     * Devuelve vacio si MP dice que no existe (ej: notificaciones de prueba con ids inventados).
     */
    public Optional<Map<String, Object>> obtenerPago(String paymentId) {
        validarToken();

        try {
            Map<String, Object> respuesta = restClient.get()
                    .uri("/v1/payments/{id}", paymentId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(TIPO_MAPA);
            return Optional.ofNullable(respuesta);

        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 404) {
                return Optional.empty();
            }
            throw new MercadoPagoException("Error de Mercado Pago al consultar el pago "
                    + paymentId + " (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
        } catch (RestClientException e) {
            throw new MercadoPagoException("No se pudo conectar con Mercado Pago: " + e.getMessage());
        }
    }

    private void validarToken() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new MercadoPagoException("Falta configurar la variable de entorno MP_ACCESS_TOKEN");
        }
    }
}
