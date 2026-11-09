package com.estoque.backend.repository;


import jakarta.persistence.Entity;

@Entity
public interface NomeDoRepository extends JpaRepository<Entidade, TipoDoId> {

}