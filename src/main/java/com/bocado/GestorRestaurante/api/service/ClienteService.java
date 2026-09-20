package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.ClienteRequest;
import com.bocado.GestorRestaurante.api.dto.ClienteResponse;
import com.bocado.GestorRestaurante.api.model.Cliente;
import com.bocado.GestorRestaurante.api.repository.ClienteRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clienteRepository;

    public ClienteResponse crearCliente(ClienteRequest request) {
        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setEmail(request.getEmail());
        cliente.setTelefono(request.getTelefono());

        Cliente clienteGuardado = clienteRepository.save(cliente);
        return new ClienteResponse(clienteGuardado);
    }

    public List<ClienteResponse> listarClientes() {
        return clienteRepository.findAll()
                .stream()
                .map(ClienteResponse::new)
                .toList();
    }

    public ClienteResponse obtenerClientePorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));
        return new ClienteResponse(cliente);
    }
}
