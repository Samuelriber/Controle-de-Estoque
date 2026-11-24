import { useEffect, useState } from 'react';

// As duas regiões ficam sempre no DOM; o texto entra depois para ser anunciado
export default function Alerta({ aviso, onFechar }) {
  const [exibido, setExibido] = useState(null);

  useEffect(() => {
    setExibido(null);
    if (!aviso) return undefined;
    const tempo = setTimeout(() => setExibido(aviso), 60);
    return () => clearTimeout(tempo);
  }, [aviso]);

  const conteudo = (tipo) =>
    exibido?.tipo === tipo && (
      <div className={`alerta alerta-${tipo}`}>
        <p>{exibido.texto}</p>
        {onFechar && (
          <button type="button" className="botao-texto" onClick={onFechar}>
            Fechar aviso
          </button>
        )}
      </div>
    );

  return (
    <>
      <div role="status">{conteudo('sucesso')}</div>
      <div role="alert">{conteudo('erro')}</div>
    </>
  );
}
