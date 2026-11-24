export default function EstadoVazio({ texto, children }) {
  return (
    <div className="estado-vazio">
      <p>{texto}</p>
      {children}
    </div>
  );
}
