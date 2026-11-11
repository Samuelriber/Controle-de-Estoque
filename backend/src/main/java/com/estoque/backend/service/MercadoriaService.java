package com.estoque.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estoque.backend.dto.MercadoriaRequest;
import com.estoque.backend.dto.MercadoriaResponse;
import com.estoque.backend.exception.RecursoNaoEncontradoException;
import com.estoque.backend.model.Mercadoria;
import com.estoque.backend.repository.MercadoriaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MercadoriaService {

    private final MercadoriaRepository repository;

    @Transactional(readOnly = true)
    public List<MercadoriaResponse> listar() { //lista as merc
        return repository.findAll().stream()
                .map(MercadoriaResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public MercadoriaResponse buscar(Integer id) { // find nas merc
        return MercadoriaResponse.de(buscarEntidade(id));
    }

    @Transactional
    public MercadoriaResponse criar(MercadoriaRequest request) { // cria as merc
        Mercadoria mercadoria = new Mercadoria();
        preencher(mercadoria, request);
        return MercadoriaResponse.de(repository.save(mercadoria));
    }

    @Transactional
    public MercadoriaResponse atualizar(Integer id, MercadoriaRequest request) { // update
        Mercadoria mercadoria = buscarEntidade(id);
        preencher(mercadoria, request);
        return MercadoriaResponse.de(repository.save(mercadoria));
    }

    @Transactional
    public void excluir(Integer id) { // exclui 
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Mercadoria não encontrada: id " + id);
        }
        repository.deleteById(id);
        repository.flush();
    }

    private Mercadoria buscarEntidade(Integer id) { // nao dispara erro 404
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mercadoria não encontrada: id " + id));
    }

    private void preencher(Mercadoria mercadoria, MercadoriaRequest request) {
        mercadoria.setNome(request.nome().trim());
        mercadoria.setPreco(request.preco());
    }
}
