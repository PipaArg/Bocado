package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.HamburguesaRequest;
import com.bocado.GestorRestaurante.api.dto.MilanesaRequest;
import com.bocado.GestorRestaurante.api.dto.PizzaRequest;
import com.bocado.GestorRestaurante.api.dto.PlatoResponse;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.model.Hamburguesa;
import com.bocado.GestorRestaurante.api.model.Milanesa;
import com.bocado.GestorRestaurante.api.model.Pizza;
import com.bocado.GestorRestaurante.api.repository.PlatoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatoService {
    private final PlatoRepository platoRepository;

    public PlatoResponse crearHamburguesa(HamburguesaRequest request) {
        String nombre = request.getNombre().trim();
        validarNombreDisponible(nombre);

        Hamburguesa hamburguesa = new Hamburguesa();
        hamburguesa.setNombre(nombre);
        hamburguesa.setDescripcion(request.getDescripcion());
        hamburguesa.setPrecio(request.getPrecio());
        hamburguesa.setConQueso(request.getConQueso());
        hamburguesa.setTipoPan(request.getTipoPan());

        return new PlatoResponse(platoRepository.save(hamburguesa));
    }

    public PlatoResponse crearPizza(PizzaRequest request) {
        String nombre = request.getNombre().trim();
        validarNombreDisponible(nombre);

        Pizza pizza = new Pizza();
        pizza.setNombre(nombre);
        pizza.setDescripcion(request.getDescripcion());
        pizza.setPrecio(request.getPrecio());
        pizza.setTamanio(request.getTamanio());
        pizza.setTipoMasa(request.getTipoMasa());

        return new PlatoResponse(platoRepository.save(pizza));
    }

    public PlatoResponse crearMilanesa(MilanesaRequest request) {
        String nombre = request.getNombre().trim();
        validarNombreDisponible(nombre);

        Milanesa milanesa = new Milanesa();
        milanesa.setNombre(nombre);
        milanesa.setDescripcion(request.getDescripcion());
        milanesa.setPrecio(request.getPrecio());
        milanesa.setTipoCarne(request.getTipoCarne());
        milanesa.setGuarnicion(request.getGuarnicion());

        return new PlatoResponse(platoRepository.save(milanesa));
    }

    public List<PlatoResponse> listarPlatos() {
        return platoRepository.findAll()
                .stream()
                .map(PlatoResponse::new)
                .toList();
    }

    private void validarNombreDisponible(String nombre) {
        if (platoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe un plato con el nombre: " + nombre);
        }
    }
}