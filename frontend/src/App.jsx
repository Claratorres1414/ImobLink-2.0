import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import PublicarPostagem from "./pages/PublicarPostagem";
import MeusAnuncios from "./pages/MeusAnuncios";
import EditarPostagem from "./pages/EditarPostagem";
import PostagemDetalhada from "./pages/PostagemDetalhada";
import UserProfile from "./pages/UserProfile";
import Busca from "./pages/Busca";

// Chat pages
import ChatPage from "./pages/ChatPage";
import ConversasPage from "./pages/ConversasPage";

// 🔒 Proteção de rotas
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

        {/* Rotas protegidas (renderam as páginas — as páginas devem conter DashboardLayout se preciso) */}
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
          path="/editar-perfil"
          element={
            <RotaProtegida>
              <EditarPerfil />
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

        <Route
          path="/post/:id"
          element={
            <RotaProtegida>
              <PostagemDetalhada />
            </RotaProtegida>
          }
        />

        <Route
          path="/user/:id"
          element={
            <RotaProtegida>
              <UserProfile />
            </RotaProtegida>
          }
        />

        <Route
          path="/busca"
          element={
            <RotaProtegida>
              <Busca />
            </RotaProtegida>
          }
        />

        {/* Conversas (lista) */}
        <Route
          path="/conversas"
          element={
            <RotaProtegida>
              <ConversasPage />
            </RotaProtegida>
          }
        />

        {/* Chat individual */}
        <Route
          path="/chat/:id"
          element={
            <RotaProtegida>
              <ChatPage />
            </RotaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
