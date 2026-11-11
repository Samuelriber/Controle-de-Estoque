package com.estoque.backend.exception;

import java.util.Map;

public record ErroResponse(int status, String mensagem, Map<String, String> campos) {

    public static ErroResponse de(int status, String mensagem) {
        return new ErroResponse(status, mensagem, null);
    }
}
