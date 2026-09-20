package com.bocado.GestorRestaurante.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/*
 * @RestControllerAdvice permite manejar los errores
 * de todos los Controllers desde una única clase.
 *
 * Evitamos repetir try/catch en cada endpoint.
 *
 * Su responsabilidad es transformar excepciones
 * en respuestas HTTP comprensibles para el cliente.
 */
@RestControllerAdvice
public class ManejadorGlobalErrores {

    /*
     * ERROR 404 - RECURSO NO ENCONTRADO
     *
     * Este método se ejecuta cuando un Service lanza
     * RecursoNoEncontradoException.
     *
     * Ejemplo: solicitar un turno que no existe.
     */
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(
            RecursoNoEncontradoException ex) {

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("status", 404);
        respuesta.put("mensaje", ex.getMessage());

        // Devolvemos HTTP 404 en lugar de un error 500.
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(respuesta);
    }


    /*
     * ERROR 400 - DATOS INVÁLIDOS
     *
     * Se ejecuta cuando @Valid detecta que un DTO
     * no cumple alguna de sus validaciones.
     *
     * Ejemplo: cantidadComensales = -5.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidaciones(
            MethodArgumentNotValidException ex) {

        // Guardamos los errores de cada campo.
        Map<String, String> errores = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {

            // Guardamos el nombre del campo y su mensaje.
            // putIfAbsent conserva el primer error de cada campo.
            errores.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage()
            );
        });

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("status", 400);
        respuesta.put("mensaje", "Los datos enviados son incorrectos");
        respuesta.put("errores", errores);

        // Devolvemos HTTP 400 porque la solicitud es inválida.
        return ResponseEntity
                .badRequest()
                .body(respuesta);
    }


    /*
     * ERROR 400 - JSON INCORRECTO
     *
     * Maneja solicitudes cuyo JSON no puede convertirse
     * correctamente al objeto Java esperado.
     *
     * Ejemplo: enviar "hola" en un campo de tipo LocalDate.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> manejarJsonInvalido(
            HttpMessageNotReadableException ex) {

        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("status", 400);

        respuesta.put(
                "mensaje",
                "El JSON enviado es inválido o contiene datos incorrectos"
        );

        // Respondemos HTTP 400 por un formato de entrada inválido.
        return ResponseEntity
                .badRequest()
                .body(respuesta);
    }

}