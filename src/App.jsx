import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import PublicarPostagem from "./pages/PublicarPostagem";
import MeusAnuncios from "./pages/MeusAnuncios";
import PostagemDetalhada from "./pages/PostagemDetalhada";
import RotaProtegida from "./components/RotaProtegida";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas */}
        <Route
          path="/home"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />
        <Route
          path="/perfil"
          element={
            <RotaProtegida>
              <Perfil />
            </RotaProtegida>
          }
        />
        <Route
          path="/publicar"
          element={
            <RotaProtegida>
              <PublicarPostagem />
            </RotaProtegida>
          }
        />
        <Route
          path="/meus-anuncios"
          element={
            <RotaProtegida>
              <MeusAnuncios />
            </RotaProtegida>
          }
        />
        <Route
          path="/post/:id" // 👈 NOVA ROTA PARA DETALHES DA POSTAGEM
          element={
            <RotaProtegida>
              <PostagemDetalhada />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
