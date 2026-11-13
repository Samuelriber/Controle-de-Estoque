package com.estoque.backend.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration

public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI().info(new Info()
                .title("API de Controle de Estoque- Trabalho de desenvolvimento web")
                .description("API REST para cadastro e controle de mercadorias e estoques.")
                .version("1.0"));
    }

}