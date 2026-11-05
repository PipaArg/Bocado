package com.bocado.GestorRestaurante.api.service;

import com.bocado.GestorRestaurante.api.dto.LoginUsuarioRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioActualizarRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioRequest;
import com.bocado.GestorRestaurante.api.dto.UsuarioResponse;
import com.bocado.GestorRestaurante.api.exception.CredencialesInvalidasException;
import com.bocado.GestorRestaurante.api.exception.RecursoDuplicadoException;
import com.bocado.GestorRestaurante.api.exception.RecursoNoEncontradoException;
import com.bocado.GestorRestaurante.api.model.Usuario;
import com.bocado.GestorRestaurante.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioResponse crearUsuario(UsuarioRequest request) {
        String nombreUsuario = request.getUsuario().trim();
        validarUsuarioDisponible(nombreUsuario, null);

        Usuario usuario = new Usuario();
        usuario.setUsuario(nombreUsuario);
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setClaveHash(passwordEncoder.encode(request.getClave()));
        usuario.setNivel(request.getNivel());
        usuario.setActivo(true);
        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::new)
                .toList();
    }

    public UsuarioResponse obtenerUsuarioPorId(Long id) {
        return new UsuarioResponse(buscarUsuario(id));
    }

    public UsuarioResponse actualizarUsuario(Long id, UsuarioActualizarRequest request) {
        Usuario usuario = buscarUsuario(id);
        String nombreUsuario = request.getUsuario().trim();
        validarUsuarioDisponible(nombreUsuario, id);

        usuario.setUsuario(nombreUsuario);
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setNivel(request.getNivel());
        usuario.setActivo(request.getActivo());
        if (request.getClave() != null && !request.getClave().isBlank()) {
            usuario.setClaveHash(passwordEncoder.encode(request.getClave()));
        }
        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.delete(buscarUsuario(id));
    }

    public UsuarioResponse iniciarSesion(LoginUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findByUsuarioIgnoreCase(request.getUsuario().trim())
                .orElseThrow(CredencialesInvalidasException::new);
        if (!usuario.isActivo() || !passwordEncoder.matches(request.getClave(), usuario.getClaveHash())) {
            throw new CredencialesInvalidasException();
        }
        return new UsuarioResponse(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado con id: " + id));
    }

    private void validarUsuarioDisponible(String nombreUsuario, Long id) {
        boolean existe = id == null
                ? usuarioRepository.existsByUsuarioIgnoreCase(nombreUsuario)
                : usuarioRepository.existsByUsuarioIgnoreCaseAndIdNot(nombreUsuario, id);
        if (existe) {
            throw new RecursoDuplicadoException(
                    "Ya existe un usuario con el nombre: " + nombreUsuario);
        }
    }
}
