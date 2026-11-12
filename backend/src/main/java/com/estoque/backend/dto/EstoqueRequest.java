package com.estoque.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record EstoqueRequest(

        @NotNull(message = "A quantidade é obrigatória")
        @PositiveOrZero(message = "A quantidade não pode ser negativa")
        Integer quantidade,

        @NotNull(message = "A quantidade mínima é obrigatória")
        @PositiveOrZero(message = "A quantidade mínima não pode ser negativa")
        Integer quantidadeMinima,

        @NotNull(message = "A quantidade máxima é obrigatória")
        @PositiveOrZero(message = "A quantidade máxima não pode ser negativa")
        Integer quantidadeMaxima,

        @NotBlank(message = "A localização é obrigatória")
        @Size(max = 100, message = "A localização deve ter no máximo 100 caracteres")
        String localizacao,

        @NotNull(message = "A mercadoria é obrigatória")
        Integer idMerc
) {
}
