package com.estoque.backend.MercadoriaRepository;


import jakarta.persistence.Entity;

@Entity
public interface NomeDoRepository extends JpaRepository<Entidade, TipoDoId> {

}