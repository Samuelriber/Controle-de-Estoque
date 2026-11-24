import { Link } from 'react-router-dom';
import { listarEstoques } from '../api/estoques.js';
import { listarMercadorias } from '../api/mercadorias.js';
import EstadoErro from '../components/EstadoErro.jsx';
import { contar, formatarInteiro } from '../lib/formatar.js';
import { useCarregar, useTitulo } from '../lib/hooks.js';
import { situacaoDe } from '../lib/situacao.js';

const carregarResumo = () => Promise.all([listarMercadorias(), listarEstoques()]);

const ENTIDADES = [
  { nome: 'Mercadorias', lista: '/mercadorias', cadastro: '/mercadorias/nova', rotuloCadastro: 'Cadastrar mercadoria' },
  { nome: 'Estoques', lista: '/estoques', cadastro: '/estoques/novo', rotuloCadastro: 'Cadastrar estoque' },
];

export default function Inicio() {
  useTitulo('Início');
  const resumo = useCarregar(carregarResumo);
  const [mercadorias, estoques] = resumo.dados ?? [];
  const totais = resumo.dados ? [mercadorias.length, estoques.length] : [];
  const abaixo = estoques?.filter((e) => situacaoDe(e) === 'abaixo').length ?? 0;

  function textoTotal(indice) {
    if (resumo.status === 'carregando') return 'Carregando';
    if (resumo.status === 'erro') return 'Indisponível';
    return formatarInteiro(totais[indice]);
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1 tabIndex={-1}>Início</h1>
      </div>
      <p className="texto-suave">Cadastro de mercadorias e controle das quantidades guardadas em cada local.</p>

      {resumo.status === 'erro' && <EstadoErro erro={resumo.erro} onTentar={resumo.recarregar} />}

      <div className="tabela-rolagem">
        <table className="tabela">
          <caption>Registros por cadastro</caption>
          <thead>
            <tr>
              <th scope="col">Cadastro</th>
              <th scope="col" className="num">Registros</th>
              <th scope="col" className="acoes">Ações</th>
            </tr>
          </thead>
          <tbody aria-busy={resumo.status === 'carregando'}>
            {ENTIDADES.map((entidade, indice) => (
              <tr key={entidade.nome}>
                <th scope="row">{entidade.nome}</th>
                <td className="num">{textoTotal(indice)}</td>
                <td className="acoes">
                  <Link className="botao botao-pequeno" to={entidade.lista} aria-label={`Ver lista de ${entidade.nome.toLowerCase()}`}>
                    Ver lista
                  </Link>
                  <Link className="botao botao-pequeno" to={entidade.cadastro} aria-label={entidade.rotuloCadastro}>
                    Cadastrar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resumo.status === 'pronto' && (
        <p className="linha-resumo">
          {abaixo === 0 ? (
            <>
              Nenhum estoque abaixo do mínimo. <Link to="/estoques">Ver estoques</Link>
            </>
          ) : (
            <>
              <strong>{contar(abaixo, 'estoque está abaixo', 'estoques estão abaixo')} do mínimo.</strong>{' '}
              <Link to="/estoques?situacao=abaixo">Ver estoques abaixo do mínimo</Link>
            </>
          )}
        </p>
      )}
    </>
  );
}
