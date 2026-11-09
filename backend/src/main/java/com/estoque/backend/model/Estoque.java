package com.estoque.backend.model;


import jakarta.persistence.*;

import java.math.BigDecimal;


@Entity
@Table(name = "estoques")
public class Estoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal quantidade;
    private BigDecimal quantidadeMinima;
    private BigDecimal quantidadeMaxima;
    private String  localizacao;

    @ManyToOne
    @JoinColumn(name = "mercadoria_id")
    private Mercadoria mercadoria;

    public Estoque() {

    }

    public Long getId() {
        return id;
    }

    public BigDecimal getQuantidade() {
        return quantidade;
    }

    public BigDecimal getQuantidadeMinima() {
        return quantidadeMinima;
    }

    public BigDecimal getQuantidadeMaxima() {
        return quantidadeMaxima;
    }

    public String  getLocalizacao() {
        return localizacao;
    }

    public Mercadoria getMercadoria() {
        return mercadoria;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuantidade(BigDecimal quantidade) {
        this.quantidade = quantidade;
    }

    public void setQuantidadeMinima(BigDecimal quantidadeMinima) {
        this.quantidadeMinima = quantidadeMinima;
    }

    public void setQuantidadeMaxima(BigDecimal quantidadeMaxima) {
        this.quantidadeMaxima = quantidadeMaxima;
    }

    public void setLocalizacao(String  localizacao) {
        this.localizacao = localizacao;
    }

    public void setMercadoria(Mercadoria mercadoria) {
        this.mercadoria = mercadoria;
    }
}
