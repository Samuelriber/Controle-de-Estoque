package com.estoque.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Libera o frontend (outra origem) para chamar a API pelo navegador
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] origensPermitidas;

    // Aceita várias origens separadas por vírgula
    public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:5173}") String[] origensPermitidas) {
        this.origensPermitidas = origensPermitidas;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        for (String rota : new String[] {"/mercadorias/**", "/estoques/**"}) {
            registry.addMapping(rota)
                    .allowedOrigins(origensPermitidas)
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("Content-Type");
        }
    }
}
