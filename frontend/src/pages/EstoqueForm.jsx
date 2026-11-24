import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarEstoque, buscarEstoque, criarEstoque } from '../api/estoques.js';
import { listarMercadorias } from '../api/mercadorias.js';
import Alerta from '../components/Alerta.jsx';
import Campo from '../components/Campo.jsx';
import Carregando from '../components/Carregando.jsx';
import EstadoErro from '../components/EstadoErro.jsx';
import EstadoVazio from '../components/EstadoVazio.jsx';
import { useCarregar, useTitulo } from '../lib/hooks.js';
import { focarPrimeiroInvalido, validarEstoque } from '../lib/validar.js';

const VAZIO = { idMerc: '', quantidade: '', quantidadeMinima: '', quantidadeMaxima: '', localizacao: '' };
const CAMPOS_NUMERICOS = ['idMerc', 'quantidade', 'quantidadeMinima', 'quantidadeMaxima'];

export default function EstoqueForm() {
  const { id } = useParams();
  const edicao = id !== undefined;
  const titulo = edicao ? 'Editar estoque' : 'Novo estoque';
  useTitulo(titulo);

  const navigate = useNavigate();
  const formRef = useRef(null);
  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const carga = useCarregar(
    () => Promise.all([listarMercadorias(), edicao ? buscarEstoque(id) : null]),
    id,
  );
  const [mercadorias, estoque] = carga.dados ?? [[], null];

  useEffect(() => {
    if (!estoque) return;
    setValores({
      idMerc: String(estoque.idMerc),
      quantidade: String(estoque.quantidade),
      quantidadeMinima: String(estoque.quantidadeMinima),
      quantidadeMaxima: String(estoque.quantidadeMaxima),
      localizacao: estoque.localizacao,
    });
  }, [estoque]);

  function alterar(evento) {
    const { name, value } = evento.target;
    setValores((atuais) => ({ ...atuais, [name]: value }));
    setErros(({ [name]: _removido, ...resto }) => resto);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setAviso(null);
    const errosCliente = validarEstoque(valores);
    setErros(errosCliente);
    if (Object.keys(errosCliente).length) {
      focarPrimeiroInvalido(formRef.current);
      return;
    }

    setEnviando(true);
    const corpo = { ...valores, localizacao: valores.localizacao.trim() };
    CAMPOS_NUMERICOS.forEach((campo) => {
      corpo[campo] = Number(valores[campo]);
    });

    try {
      const salvo = edicao ? await atualizarEstoque(id, corpo) : await criarEstoque(corpo);
      const acao = edicao ? 'alterado' : 'cadastrado';
      const texto = `Estoque de '${salvo.nomeMercadoria}' em '${salvo.localizacao}' ${acao}.`;
      navigate('/estoques', { state: { aviso: { tipo: 'sucesso', texto } } });
    } catch (erro) {
      setEnviando(false);
      if (erro.campos) {
        setErros(erro.campos);
        focarPrimeiroInvalido(formRef.current);
      }
      setAviso({ tipo: 'erro', texto: erro.campos ? `${erro.mensagem}. Revise os campos indicados.` : erro.mensagem });
    }
  }

  let conteudo;
  if (carga.status === 'carregando') {
    conteudo = <Carregando texto="Carregando dados do estoque..." />;
  } else if (carga.status === 'erro') {
    conteudo = (
      <EstadoErro erro={carga.erro} onTentar={carga.recarregar}>
        <Link to="/estoques">Voltar para a lista</Link>
      </EstadoErro>
    );
  } else {
    const semMercadorias = mercadorias.length === 0;
    conteudo = (
      <>
        {semMercadorias && (
          <EstadoVazio texto="Nenhuma mercadoria cadastrada. Cadastre a primeira para poder criar estoques.">
            <Link to="/mercadorias/nova">Cadastrar mercadoria</Link>
          </EstadoVazio>
        )}
        <form ref={formRef} className="formulario" onSubmit={salvar} noValidate>
          <fieldset className="grupo" disabled={semMercadorias || enviando}>
            <legend className="visualmente-oculto">Dados do estoque</legend>
            <Campo id="idMerc" rotulo="Mercadoria" como="select" value={valores.idMerc} onChange={alterar} erro={erros.idMerc}>
              <option value="">Selecione a mercadoria</option>
              {mercadorias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} (id {m.id})
                </option>
              ))}
            </Campo>
            <Campo
              id="quantidade"
              rotulo="Quantidade atual"
              value={valores.quantidade}
              onChange={alterar}
              erro={erros.quantidade}
              inputMode="numeric"
              autoComplete="off"
              className="controle controle-numero"
            />
            <Campo
              id="quantidadeMinima"
              rotulo="Quantidade mínima"
              value={valores.quantidadeMinima}
              onChange={alterar}
              erro={erros.quantidadeMinima}
              inputMode="numeric"
              autoComplete="off"
              className="controle controle-numero"
            />
            <Campo
              id="quantidadeMaxima"
              rotulo="Quantidade máxima"
              dica="Precisa ser igual ou maior que a quantidade mínima."
              value={valores.quantidadeMaxima}
              onChange={alterar}
              erro={erros.quantidadeMaxima}
              inputMode="numeric"
              autoComplete="off"
              className="controle controle-numero"
            />
            <Campo
              id="localizacao"
              rotulo="Localização"
              dica="Onde a mercadoria fica guardada, por exemplo Prateleira A1."
              value={valores.localizacao}
              onChange={alterar}
              erro={erros.localizacao}
              autoComplete="off"
            />
            <div className="linha-acoes">
              <button type="submit" className="botao botao-principal">
                {enviando ? 'Salvando...' : 'Salvar estoque'}
              </button>
              <Link className="botao" to="/estoques">
                Cancelar
              </Link>
            </div>
          </fieldset>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1 tabIndex={-1}>{titulo}</h1>
        {edicao && <span className="identificador">Id {id}</span>}
      </div>
      <Alerta aviso={aviso} />
      {conteudo}
    </>
  );
}
