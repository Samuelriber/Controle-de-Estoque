package com.estoque.backend.repository;


import com.estoque.backend.model.Mercadoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MercadoriaRepository extends JpaRepository<Mercadoria, Long> {

}