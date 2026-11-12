package com.estoque.backend.service;

import com.estoque.backend.dto.EstoqueRequest;
import com.estoque.backend.dto.EstoqueResponse;
import com.estoque.backend.exception.RecursoNaoEncontradoException;
import com.estoque.backend.exception.RegraNegocioException;
import com.estoque.backend.model.Estoque;
import com.estoque.backend.model.Mercadoria;
import com.estoque.backend.repository.EstoqueRepository;
import com.estoque.backend.repository.MercadoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final EstoqueRepository estoqueRepository;
    private final MercadoriaRepository mercadoriaRepository;

    @Transactional(readOnly = true)
    public List<EstoqueResponse> listar() {
        return estoqueRepository.findAll().stream()
                .map(EstoqueResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public EstoqueResponse buscar(Integer id) {
        return EstoqueResponse.de(buscarEntidade(id));
    }

    @Transactional
    public EstoqueResponse criar(EstoqueRequest request) {
        Estoque estoque = new Estoque();
        preencher(estoque, request);
        return EstoqueResponse.de(estoqueRepository.save(estoque));
    }

    @Transactional
    public EstoqueResponse atualizar(Integer id, EstoqueRequest request) {
        Estoque estoque = buscarEntidade(id);
        preencher(estoque, request);
        return EstoqueResponse.de(estoqueRepository.save(estoque));
    }

    @Transactional
    public void excluir(Integer id) {
        if (!estoqueRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Estoque não encontrado: id " + id);
        }
        estoqueRepository.deleteById(id);
    }

    private Estoque buscarEntidade(Integer id) {
        return estoqueRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Estoque não encontrado: id " + id));
    }

    private void preencher(Estoque estoque, EstoqueRequest request) {
        if (request.quantidadeMaxima() < request.quantidadeMinima()) {
            throw new RegraNegocioException("A quantidade máxima não pode ser menor que a quantidade mínima");
        }

        Mercadoria mercadoria = mercadoriaRepository.findById(request.idMerc())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Mercadoria não encontrada: id " + request.idMerc()));

        estoque.setQuantidade(request.quantidade());
        estoque.setQuantidadeMinima(request.quantidadeMinima());
        estoque.setQuantidadeMaxima(request.quantidadeMaxima());
        estoque.setLocalizacao(request.localizacao().trim());
        estoque.setMercadoria(mercadoria);
    }
}
