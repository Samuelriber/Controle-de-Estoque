package com.estoque.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.estoque.backend.model.Mercadoria;

public interface MercadoriaRepository extends JpaRepository<Mercadoria, Integer> {
}