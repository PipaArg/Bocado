package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.PagoRequest;
import com.bocado.GestorRestaurante.api.dto.PagoResponse;
import com.bocado.GestorRestaurante.api.model.EstadoPago;
import com.bocado.GestorRestaurante.api.model.Pago;
import com.bocado.GestorRestaurante.api.repository.PagoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PagoService {
    private final PagoRepository pagoRepository;

    //mas adelante integrar con checkout de mP
    public Pago crearPago(PagoRequest request) {
        Pago pago = new Pago();
        pago.setMonto(request.getMonto());
        pago.setEstado(EstadoPago.PENDIENTE);
        pago.setFechaCreacion(LocalDateTime.now());

        return pagoRepository.save(pago);
    }

    public PagoResponse cambiarEstado(Long id, EstadoPago estado) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        pago.setEstado(estado);
        return new PagoResponse(pagoRepository.save(pago));
    }
}
