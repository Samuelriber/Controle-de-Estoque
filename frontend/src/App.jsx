import { HashRouter, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import EstoqueForm from './pages/EstoqueForm.jsx';
import EstoquesLista from './pages/EstoquesLista.jsx';
import Inicio from './pages/Inicio.jsx';
import MercadoriaForm from './pages/MercadoriaForm.jsx';
import MercadoriasLista from './pages/MercadoriasLista.jsx';
import NaoEncontrada from './pages/NaoEncontrada.jsx';

// Só abre a edição quando o id da URL é numérico, como o backend espera
function ComIdNumerico({ children }) {
  const { id } = useParams();
  return /^\d+$/.test(id) ? children : <NaoEncontrada />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="mercadorias" element={<MercadoriasLista />} />
          <Route path="mercadorias/nova" element={<MercadoriaForm />} />
          <Route path="mercadorias/:id/editar" element={<ComIdNumerico><MercadoriaForm /></ComIdNumerico>} />
          <Route path="estoques" element={<EstoquesLista />} />
          <Route path="estoques/novo" element={<EstoqueForm />} />
          <Route path="estoques/:id/editar" element={<ComIdNumerico><EstoqueForm /></ComIdNumerico>} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
