import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarMercadoria, buscarMercadoria, criarMercadoria } from '../api/mercadorias.js';
import Alerta from '../components/Alerta.jsx';
import Campo from '../components/Campo.jsx';
import Carregando from '../components/Carregando.jsx';
import EstadoErro from '../components/EstadoErro.jsx';
import { precoParaTexto } from '../lib/formatar.js';
import { useCarregar, useTitulo } from '../lib/hooks.js';
import { focarPrimeiroInvalido, lerPreco, validarMercadoria } from '../lib/validar.js';

const VAZIO = { nome: '', preco: '' };

export default function MercadoriaForm() {
  const { id } = useParams();
  const edicao = id !== undefined;
  const titulo = edicao ? 'Editar mercadoria' : 'Nova mercadoria';
  useTitulo(titulo);

  const navigate = useNavigate();
  const formRef = useRef(null);
  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const carga = useCarregar(() => (edicao ? buscarMercadoria(id) : Promise.resolve(null)), id);

  useEffect(() => {
    if (carga.dados) setValores({ nome: carga.dados.nome, preco: precoParaTexto(carga.dados.preco) });
  }, [carga.dados]);

  function alterar(evento) {
    const { name, value } = evento.target;
    setValores((atuais) => ({ ...atuais, [name]: value }));
    setErros(({ [name]: _removido, ...resto }) => resto);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setAviso(null);
    const errosCliente = validarMercadoria(valores);
    setErros(errosCliente);
    if (Object.keys(errosCliente).length) {
      focarPrimeiroInvalido(formRef.current);
      return;
    }

    setEnviando(true);
    const corpo = { nome: valores.nome.trim(), preco: lerPreco(valores.preco) };
    try {
      const salva = edicao ? await atualizarMercadoria(id, corpo) : await criarMercadoria(corpo);
      const acao = edicao ? 'alterada' : 'cadastrada';
      navigate('/mercadorias', { state: { aviso: { tipo: 'sucesso', texto: `Mercadoria '${salva.nome}' ${acao}.` } } });
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
    conteudo = <Carregando texto="Carregando mercadoria..." />;
  } else if (carga.status === 'erro') {
    conteudo = (
      <EstadoErro erro={carga.erro} onTentar={carga.recarregar}>
        <Link to="/mercadorias">Voltar para a lista</Link>
      </EstadoErro>
    );
  } else {
    conteudo = (
      <form ref={formRef} className="formulario" onSubmit={salvar} noValidate>
        <Campo id="nome" rotulo="Nome" value={valores.nome} onChange={alterar} erro={erros.nome} autoComplete="off" />
        <Campo
          id="preco"
          rotulo="Preço (R$)"
          dica="Use vírgula ou ponto para os centavos, por exemplo 25,90."
          value={valores.preco}
          onChange={alterar}
          erro={erros.preco}
          inputMode="decimal"
          autoComplete="off"
          className="controle controle-numero"
        />
        <div className="linha-acoes">
          <button type="submit" className="botao botao-principal" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar mercadoria'}
          </button>
          <Link className="botao" to="/mercadorias">
            Cancelar
          </Link>
        </div>
      </form>
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
