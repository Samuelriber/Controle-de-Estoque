const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const ENDERECO_BACKEND = BASE ? BASE.replace(/^https?:\/\//, '') : 'localhost:8080';

export const MENSAGEM_REDE =
  `Não foi possível falar com o servidor. Confira se o backend está rodando em ${ENDERECO_BACKEND}.`;

export class ErroApi extends Error {
  constructor({ status, mensagem, campos = null }) {
    super(mensagem);
    this.status = status;
    this.mensagem = mensagem;
    this.campos = campos && Object.keys(campos).length ? campos : null;
  }

  get rede() {
    return this.status === 0;
  }
}

async function lerJson(resposta) {
  const tipo = resposta.headers.get('Content-Type') ?? '';
  if (!tipo.includes('json')) return null;
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

export async function requisitar(caminho, { metodo = 'GET', corpo } = {}) {
  let resposta;
  try {
    resposta = await fetch(BASE + caminho, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi({ status: 0, mensagem: MENSAGEM_REDE });
  }

  if (resposta.status === 204) return null;

  const dados = await lerJson(resposta);
  if (resposta.ok) return dados;

  // Sem corpo JSON em 502, 503 ou 504: o backend não respondeu (proxy ou gateway)
  if (!dados && [502, 503, 504].includes(resposta.status)) {
    throw new ErroApi({ status: 0, mensagem: MENSAGEM_REDE });
  }

  throw new ErroApi({
    status: resposta.status,
    mensagem: dados?.mensagem ?? `O servidor recusou a operação (erro ${resposta.status}).`,
    campos: dados?.campos,
  });
}
