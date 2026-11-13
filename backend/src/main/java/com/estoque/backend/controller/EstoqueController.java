package com.estoque.backend.controller;

import com.estoque.backend.dto.EstoqueRequest;
import com.estoque.backend.dto.EstoqueResponse;
import com.estoque.backend.service.EstoqueService;
import io.swagger.v3.oas.annotations.tags.Tag; // swagger
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Estoques", description = "Controle de estoque das mercadorias") // swagger
@RestController
@RequestMapping("/estoques")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService service;

    @GetMapping
    public List<EstoqueResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public EstoqueResponse buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EstoqueResponse criar(@Valid @RequestBody EstoqueRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public EstoqueResponse atualizar(@PathVariable Integer id,
                                     @Valid @RequestBody EstoqueRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer id) {
        service.excluir(id);
    }
}
