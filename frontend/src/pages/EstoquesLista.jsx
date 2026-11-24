import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { excluirEstoque, listarEstoques } from '../api/estoques.js';
import Alerta from '../components/Alerta.jsx';
import Carregando from '../components/Carregando.jsx';
import ConfirmarExclusao from '../components/ConfirmarExclusao.jsx';
import EstadoErro from '../components/EstadoErro.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import { contar, formatarInteiro } from '../lib/formatar.js';
import { useAviso, useCarregar, useTitulo } from '../lib/hooks.js';
import { ROTULOS_SITUACAO, situacaoDe } from '../lib/situacao.js';

export default function EstoquesLista() {
  useTitulo('Estoques');
  const tituloRef = useRef(null);
  const [parametros] = useSearchParams();
  const soAbaixo = parametros.get('situacao') === 'abaixo';
  const [aviso, setAviso] = useAviso();
  const lista = useCarregar(listarEstoques);
  const [alvo, setAlvo] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await excluirEstoque(alvo.id);
      lista.alterarDados((dados) => dados.filter((e) => e.id !== alvo.id));
      setAviso({
        tipo: 'sucesso',
        texto: `Estoque de '${alvo.nomeMercadoria}' em '${alvo.localizacao}' excluído.`,
      });
      requestAnimationFrame(() => tituloRef.current?.focus());
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.mensagem });
      if (erro.status === 404) lista.recarregar();
    } finally {
      setExcluindo(false);
      setAlvo(null);
    }
  }

  const visiveis = lista.dados?.filter((e) => !soAbaixo || situacaoDe(e) === 'abaixo') ?? [];

  let conteudo;
  if (lista.status === 'carregando') {
    conteudo = <Carregando texto="Carregando estoques..." />;
  } else if (lista.status === 'erro') {
    conteudo = <EstadoErro erro={lista.erro} onTentar={lista.recarregar} />;
  } else if (lista.dados.length === 0) {
    conteudo = (
      <EstadoVazio texto="Nenhum estoque cadastrado. Cada estoque liga uma mercadoria a um local e às quantidades mínima e máxima.">
        <Link to="/estoques/novo">Cadastrar estoque</Link>
      </EstadoVazio>
    );
  } else if (visiveis.length === 0) {
    conteudo = (
      <EstadoVazio texto="Nenhum estoque abaixo do mínimo.">
        <Link to="/estoques">Mostrar todos os estoques</Link>
      </EstadoVazio>
    );
  } else {
    const legenda = soAbaixo
      ? contar(visiveis.length, 'estoque abaixo do mínimo', 'estoques abaixo do mínimo')
      : contar(visiveis.length, 'estoque cadastrado', 'estoques cadastrados');

    conteudo = (
      <div className="tabela-rolagem">
        <table className="tabela">
          <caption>{legenda}</caption>
          <thead>
            <tr>
              <th scope="col">Mercadoria</th>
              <th scope="col" className="num">Quantidade</th>
              <th scope="col" className="num">Mínima</th>
              <th scope="col" className="num">Máxima</th>
              <th scope="col">Localização</th>
              <th scope="col">Situação</th>
              <th scope="col" className="acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((estoque) => {
              const situacao = situacaoDe(estoque);
              const descricao = `${estoque.nomeMercadoria} em ${estoque.localizacao}`;
              return (
                <tr key={estoque.id}>
                  <th scope="row">{estoque.nomeMercadoria}</th>
                  <td className="num">{formatarInteiro(estoque.quantidade)}</td>
                  <td className="num">{formatarInteiro(estoque.quantidadeMinima)}</td>
                  <td className="num">{formatarInteiro(estoque.quantidadeMaxima)}</td>
                  <td>{estoque.localizacao}</td>
                  <td className={`situacao situacao-${situacao}`}>{ROTULOS_SITUACAO[situacao]}</td>
                  <td className="acoes">
                    <Link
                      className="botao botao-pequeno"
                      to={`/estoques/${estoque.id}/editar`}
                      aria-label={`Editar estoque de ${descricao}`}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="botao botao-pequeno botao-perigo"
                      onClick={() => setAlvo(estoque)}
                      aria-label={`Excluir estoque de ${descricao}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1 ref={tituloRef} tabIndex={-1}>Estoques</h1>
        <Link className="botao botao-principal" to="/estoques/novo">
          Novo estoque
        </Link>
      </div>
      {lista.status === 'pronto' && lista.dados.length > 0 && (
        <p className="filtro">
          {soAbaixo ? (
            <>
              Mostrando só os estoques abaixo do mínimo. <Link to="/estoques">Mostrar todos</Link>
            </>
          ) : (
            <Link to="/estoques?situacao=abaixo">Mostrar só os abaixo do mínimo</Link>
          )}
        </p>
      )}
      <Alerta aviso={aviso} onFechar={() => setAviso(null)} />
      {conteudo}
      <ConfirmarExclusao
        aberto={Boolean(alvo)}
        titulo="Excluir estoque"
        mensagem={
          alvo &&
          `Excluir o estoque de '${alvo.nomeMercadoria}' em '${alvo.localizacao}'? Essa ação não pode ser desfeita.`
        }
        enviando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAlvo(null)}
      />
    </>
  );
}
