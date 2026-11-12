package com.estoque.backend.dto;

import com.estoque.backend.model.Estoque;

public record EstoqueResponse(
        Integer id,
        Integer quantidade,
        Integer quantidadeMinima,
        Integer quantidadeMaxima,
        String localizacao,
        Integer idMerc,
        String nomeMercadoria
) {

    public static EstoqueResponse de(Estoque estoque) {
        return new EstoqueResponse(
                estoque.getId(),
                estoque.getQuantidade(),
                estoque.getQuantidadeMinima(),
                estoque.getQuantidadeMaxima(),
                estoque.getLocalizacao(),
                estoque.getMercadoria().getId(),
                estoque.getMercadoria().getNome()
        );
    }
}
