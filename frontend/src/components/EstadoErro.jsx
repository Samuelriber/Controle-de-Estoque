export default function EstadoErro({ erro, onTentar, children }) {
  const podeTentar = onTentar && erro?.status !== 404;

  return (
    <div className="estado-erro" role="alert">
      <p>{erro?.mensagem ?? 'Ocorreu um erro inesperado ao carregar os dados.'}</p>
      <div className="linha-acoes">
        {podeTentar && (
          <button type="button" className="botao" onClick={onTentar}>
            Tentar de novo
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
