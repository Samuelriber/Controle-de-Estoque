const MAIOR_INTEIRO = 2147483647;

export const lerPreco = (texto) => Number(texto.trim().replace(',', '.'));

function validarTexto(valor, rotulo, obrigatorioMsg) {
  const texto = valor.trim();
  if (!texto) return obrigatorioMsg;
  if (texto.length > 100) return `${rotulo} deve ter no máximo 100 caracteres`;
  return null;
}

function validarInteiro(valor, obrigatorioMsg, negativoMsg) {
  const texto = valor.trim();
  if (!texto) return obrigatorioMsg;
  if (/^-\d/.test(texto)) return negativoMsg;
  if (!/^\d+$/.test(texto)) return 'Informe um número inteiro, sem vírgula ou ponto';
  if (Number(texto) > MAIOR_INTEIRO) return 'O valor informado é grande demais';
  return null;
}

function semVazios(erros) {
  return Object.fromEntries(Object.entries(erros).filter(([, msg]) => msg));
}

export function validarMercadoria({ nome, preco }) {
  const texto = preco.trim();
  let erroPreco = null;
  if (!texto) erroPreco = 'O preço é obrigatório';
  else if (/^-\d/.test(texto)) erroPreco = 'O preço não pode ser negativo';
  else if (!/^\d+([.,]\d+)?$/.test(texto)) erroPreco = 'Informe o preço só com números, por exemplo 25,90';
  else if (!/^\d{1,8}([.,]\d{1,2})?$/.test(texto))
    erroPreco = 'O preço deve ter no máximo 8 dígitos inteiros e 2 decimais';

  return semVazios({
    nome: validarTexto(nome, 'O nome', 'O nome é obrigatório'),
    preco: erroPreco,
  });
}

export function validarEstoque(valores) {
  const erros = {
    idMerc: valores.idMerc ? null : 'Selecione a mercadoria',
    quantidade: validarInteiro(
      valores.quantidade,
      'A quantidade é obrigatória',
      'A quantidade não pode ser negativa',
    ),
    quantidadeMinima: validarInteiro(
      valores.quantidadeMinima,
      'A quantidade mínima é obrigatória',
      'A quantidade mínima não pode ser negativa',
    ),
    quantidadeMaxima: validarInteiro(
      valores.quantidadeMaxima,
      'A quantidade máxima é obrigatória',
      'A quantidade máxima não pode ser negativa',
    ),
    localizacao: validarTexto(valores.localizacao, 'A localização', 'A localização é obrigatória'),
  };

  if (!erros.quantidadeMinima && !erros.quantidadeMaxima &&
      Number(valores.quantidadeMaxima) < Number(valores.quantidadeMinima)) {
    erros.quantidadeMaxima = 'A quantidade máxima não pode ser menor que a quantidade mínima';
  }

  return semVazios(erros);
}

// Espera o React aplicar aria-invalid antes de mover o foco
export function focarPrimeiroInvalido(formulario) {
  requestAnimationFrame(() => {
    formulario?.querySelector('[aria-invalid="true"]')?.focus();
  });
}
