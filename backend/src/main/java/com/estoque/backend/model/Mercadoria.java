package com.estoque.backend.model;
 
import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Entity // Mostra que representa uma tabela do banco
@Table(name = "mercadoria") //nome da tabela no banco
@Getter
@Setter
@NoArgsConstructor
public class Mercadoria {
 
    @Id // Mostra q é primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) //basicamente o auto increment do banco
    @Column(name = "id_merc") // liga o atributo a uma coluna
    private Integer id;
 
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;
 
    @Column(name = "preco", nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;
}
 