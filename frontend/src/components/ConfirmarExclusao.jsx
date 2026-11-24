import { useEffect, useRef } from 'react';

export default function ConfirmarExclusao({ aberto, titulo, mensagem, enviando, onConfirmar, onCancelar }) {
  const dialogoRef = useRef(null);
  const cancelarRef = useRef(null);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (aberto && !dialogo.open) {
      dialogo.showModal();
      cancelarRef.current.focus();
    } else if (!aberto && dialogo.open) {
      dialogo.close();
    }
  }, [aberto]);

  function aoCancelarPeloTeclado(evento) {
    evento.preventDefault();
    if (!enviando) onCancelar();
  }

  return (
    <dialog
      ref={dialogoRef}
      className="dialogo"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-mensagem"
      onCancel={aoCancelarPeloTeclado}
    >
      <h2 id="dialogo-titulo">{titulo}</h2>
      <p id="dialogo-mensagem">{mensagem}</p>
      <div className="dialogo-acoes">
        <button ref={cancelarRef} type="button" className="botao" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="button" className="botao botao-perigo-cheio" onClick={onConfirmar} disabled={enviando}>
          {enviando ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </dialog>
  );
}
