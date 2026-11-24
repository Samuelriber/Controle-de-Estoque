export const ROTULOS_SITUACAO = {
  abaixo: 'Abaixo do mínimo',
  faixa: 'Dentro da faixa',
  acima: 'Acima do máximo',
};

export function situacaoDe({ quantidade, quantidadeMinima, quantidadeMaxima }) {
  if (quantidade < quantidadeMinima) return 'abaixo';
  if (quantidade > quantidadeMaxima) return 'acima';
  return 'faixa';
}
