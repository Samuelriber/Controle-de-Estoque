import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = `${titulo} | Controle de Estoque`;
  }, [titulo]);
}

// Carrega dados ao montar e sempre que a chave muda; recarregar() refaz a requisição
export function useCarregar(carregar, chave = '') {
  const carregarRef = useRef(carregar);
  carregarRef.current = carregar;
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({ status: 'carregando', dados: null, erro: null });

  useEffect(() => {
    let ativo = true;
    setEstado({ status: 'carregando', dados: null, erro: null });
    carregarRef.current().then(
      (dados) => ativo && setEstado({ status: 'pronto', dados, erro: null }),
      (erro) => ativo && setEstado({ status: 'erro', dados: null, erro }),
    );
    return () => {
      ativo = false;
    };
  }, [chave, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
  const alterarDados = useCallback(
    (alterar) => setEstado((atual) => ({ ...atual, dados: alterar(atual.dados) })),
    [],
  );

  return { ...estado, recarregar, alterarDados };
}

// Lê o aviso enviado por navigate(..., { state: { aviso } }) e limpa o histórico
export function useAviso() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(location.state?.aviso ?? null);

  useEffect(() => {
    if (location.state?.aviso) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    }
    // Só na montagem: o aviso vale para a chegada na tela
  }, []);

  return [aviso, setAviso];
}
