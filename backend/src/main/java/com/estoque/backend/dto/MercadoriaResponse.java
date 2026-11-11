package com.estoque.backend.dto;

import java.math.BigDecimal;

import com.estoque.backend.model.Mercadoria;
// Oq o sistema devolve ao user
public record MercadoriaResponse(Integer id, String nome, BigDecimal preco) {

    public static MercadoriaResponse de(Mercadoria mercadoria) {
        return new MercadoriaResponse(
                mercadoria.getId(),
                mercadoria.getNome(),
                mercadoria.getPreco()
        );
    }
}
