package com.estoque.backend.controller;

import java.util.List;

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

import com.estoque.backend.dto.MercadoriaRequest;
import com.estoque.backend.dto.MercadoriaResponse;
import com.estoque.backend.service.MercadoriaService;

import io.swagger.v3.oas.annotations.tags.Tag; // swagger
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Mercadorias", description = "Cadastro e consulta de mercadorias") // swagger
 // contra as pesquisas
@RestController
@RequestMapping("/mercadorias")
@RequiredArgsConstructor
public class MercadoriaController {

    private final MercadoriaService service;

    @GetMapping
    public List<MercadoriaResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public MercadoriaResponse buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MercadoriaResponse criar(@Valid @RequestBody MercadoriaRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    public MercadoriaResponse atualizar(@PathVariable Integer id,
                                        @Valid @RequestBody MercadoriaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer id) {
        service.excluir(id);
    }
}
