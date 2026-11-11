package com.estoque.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity // Mostra que representa uma tabela do banco
@Table(name = "estoque")//nome da tabela no banco
@Getter
@Setter
@NoArgsConstructor
public class Estoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estoque")
    private Integer id;

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "quant_min", nullable = false)
    private Integer quantidadeMinima;

    @Column(name = "quant_max", nullable = false)
    private Integer quantidadeMaxima;

    @Column(name = "localizacao", nullable = false, length = 100)
    private String localizacao;

    @ManyToOne(optional = false) // n para 1
    @JoinColumn(name = "id_merc", nullable = false)  // Conecta as tabelas, muitos estoques para uma mercadoria
    private Mercadoria mercadoria;
}