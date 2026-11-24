const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR');

export const formatarMoeda = (valor) => moeda.format(Number(valor));
export const formatarInteiro = (valor) => inteiro.format(valor);

export function contar(quantidade, singular, plural) {
  return `${formatarInteiro(quantidade)} ${quantidade === 1 ? singular : plural}`;
}

// 25.9 vira "25,90" para edição no formulário
export const precoParaTexto = (valor) => Number(valor).toFixed(2).replace('.', ',');
