package com.estoque.backend.repository; //acesso ao banco
 
import org.springframework.data.jpa.repository.JpaRepository;

import com.estoque.backend.model.Estoque;
 
public interface EstoqueRepository extends JpaRepository<Estoque, Integer> {
}
