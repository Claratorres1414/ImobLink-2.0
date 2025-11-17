import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import PublicarPostagem from "./pages/PublicarPostagem";
import MeusAnuncios from "./pages/MeusAnuncios";
import EditarPostagem from "./pages/EditarPostagem";
import PostagemDetalhada from "./pages/PostagemDetalhada"; // ✅ import novo

// 🔒 Componente para proteger rotas
function RotaProtegida({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

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
          path="/editar-postagem/:id"
          element={
            <RotaProtegida>
              <EditarPostagem />
            </RotaProtegida>
          }
        />

        {/* ✅ Rota nova para detalhes da postagem */}
        <Route
          path="/post/:id"
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
