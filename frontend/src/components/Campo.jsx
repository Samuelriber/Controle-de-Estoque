export default function Campo({ id, rotulo, erro, dica, como: Controle = 'input', children, ...props }) {
  const idDica = `${id}-dica`;
  const idErro = `${id}-erro`;
  const descricao = [dica && idDica, erro && idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      {dica && (
        <p id={idDica} className="campo-dica">
          {dica}
        </p>
      )}
      <Controle
        id={id}
        name={id}
        className="controle"
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        {...props}
      >
        {children}
      </Controle>
      {erro && (
        <p id={idErro} className="campo-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
