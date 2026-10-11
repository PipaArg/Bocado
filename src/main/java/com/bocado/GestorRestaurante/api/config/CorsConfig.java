package com.bocado.GestorRestaurante.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

/*
 * CORS: define que paginas web pueden llamar a esta API desde el navegador.
 *
 * Siempre se permiten los servidores de desarrollo del front (Vite).
 * Para sumar otros origenes (ej: la web publicada en Vercel) se usa la variable
 * de entorno CORS_ALLOWED_ORIGINS, separados por coma. Acepta comodines:
 *   $env:CORS_ALLOWED_ORIGINS="https://bocado.vercel.app,https://*.vercel.app"
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:${CORS_ALLOWED_ORIGINS:}}")
    private String origenesExtra;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origenes = new ArrayList<>(List.of(
                "http://localhost:5173",
                "http://localhost:4173"));

        for (String origen : origenesExtra.split(",")) {
            if (!origen.isBlank()) {
                origenes.add(origen.trim());
            }
        }

        registry.addMapping("/api/**")
                .allowedOriginPatterns(origenes.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
