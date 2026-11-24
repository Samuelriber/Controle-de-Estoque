import { Link } from 'react-router-dom';
import { useTitulo } from '../lib/hooks.js';

export default function NaoEncontrada() {
  useTitulo('Página não encontrada');
  return (
    <>
      <div className="cabecalho-pagina">
        <h1 tabIndex={-1}>Página não encontrada</h1>
      </div>
      <p>O endereço aberto não corresponde a nenhuma tela do sistema.</p>
      <p>
        <Link to="/">Voltar para o início</Link>
      </p>
    </>
  );
}
