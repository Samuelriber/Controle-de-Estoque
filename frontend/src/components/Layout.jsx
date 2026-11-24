import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { pathname } = useLocation();
  const conteudoRef = useRef(null);
  const caminhoAnterior = useRef(pathname);

  // Ao trocar de tela, leva o foco ao título para o leitor de tela anunciar a página nova
  useEffect(() => {
    if (caminhoAnterior.current === pathname) return;
    caminhoAnterior.current = pathname;
    conteudoRef.current?.querySelector('h1')?.focus();
  }, [pathname]);

  function pularParaConteudo(evento) {
    evento.preventDefault();
    conteudoRef.current?.querySelector('h1')?.focus();
  }

  return (
    <>
      <a className="pular" href="#conteudo" onClick={pularParaConteudo}>
        Pular para o conteúdo
      </a>
      <header className="topo">
        <div className="topo-interno">
          <Link className="marca" to="/">
            Controle de Estoque
          </Link>
          <nav aria-label="Principal">
            <ul className="nav">
              <li>
                <NavLink to="/mercadorias">Mercadorias</NavLink>
              </li>
              <li>
                <NavLink to="/estoques">Estoques</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="conteudo" ref={conteudoRef}>
        <Outlet />
      </main>
    </>
  );
}
