import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { excluirMercadoria, listarMercadorias } from '../api/mercadorias.js';
import Alerta from '../components/Alerta.jsx';
import Carregando from '../components/Carregando.jsx';
import ConfirmarExclusao from '../components/ConfirmarExclusao.jsx';
import EstadoErro from '../components/EstadoErro.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import { contar, formatarMoeda } from '../lib/formatar.js';
import { useAviso, useCarregar, useTitulo } from '../lib/hooks.js';

export default function MercadoriasLista() {
  useTitulo('Mercadorias');
  const tituloRef = useRef(null);
  const [aviso, setAviso] = useAviso();
  const lista = useCarregar(listarMercadorias);
  const [alvo, setAlvo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await excluirMercadoria(alvo.id);
      lista.alterarDados((dados) => dados.filter((m) => m.id !== alvo.id));
      setAviso({ tipo: 'sucesso', texto: `Mercadoria '${alvo.nome}' excluída.` });
      requestAnimationFrame(() => tituloRef.current?.focus());
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.mensagem });
      if (erro.status === 404) lista.recarregar();
    } finally {
      setExcluindo(false);
      setAlvo(null);
    }
  }

  let conteudo;
  if (lista.status === 'carregando') {
    conteudo = <Carregando texto="Carregando mercadorias..." />;
  } else if (lista.status === 'erro') {
    conteudo = <EstadoErro erro={lista.erro} onTentar={lista.recarregar} />;
  } else if (lista.dados.length === 0) {
    conteudo = (
      <EstadoVazio texto="Nenhuma mercadoria cadastrada. Cadastre a primeira para poder criar estoques.">
        <Link to="/mercadorias/nova">Cadastrar mercadoria</Link>
      </EstadoVazio>
    );
  } else {
    conteudo = (
      <div className="tabela-rolagem">
        <table className="tabela">
          <caption>{contar(lista.dados.length, 'mercadoria cadastrada', 'mercadorias cadastradas')}</caption>
          <thead>
            <tr>
              <th scope="col" className="num">Id</th>
              <th scope="col">Nome</th>
              <th scope="col" className="num">Preço</th>
              <th scope="col" className="acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.dados.map((mercadoria) => (
              <tr key={mercadoria.id}>
                <td className="num">{mercadoria.id}</td>
                <th scope="row">{mercadoria.nome}</th>
                <td className="num">{formatarMoeda(mercadoria.preco)}</td>
                <td className="acoes">
                  <Link
                    className="botao botao-pequeno"
                    to={`/mercadorias/${mercadoria.id}/editar`}
                    aria-label={`Editar ${mercadoria.nome}`}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="botao botao-pequeno botao-perigo"
                    onClick={() => setAlvo(mercadoria)}
                    aria-label={`Excluir ${mercadoria.nome}`}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1 ref={tituloRef} tabIndex={-1}>Mercadorias</h1>
        <Link className="botao botao-principal" to="/mercadorias/nova">
          Nova mercadoria
        </Link>
      </div>
      <Alerta aviso={aviso} onFechar={() => setAviso(null)} />
      {conteudo}
      <ConfirmarExclusao
        aberto={Boolean(alvo)}
        titulo="Excluir mercadoria"
        mensagem={alvo && `Excluir '${alvo.nome}'? Essa ação não pode ser desfeita.`}
        enviando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
