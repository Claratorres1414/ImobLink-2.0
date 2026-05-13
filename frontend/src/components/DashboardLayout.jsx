import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const menuRef = useRef(null);
  const token = localStorage.getItem("token");

  const sair = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const irParaPerfil = () => {
    navigate("/perfil");
    setMenuAberto(false);
  };

  const irParaConfiguracoes = () => {
    alert("Configurações ainda em desenvolvimento!");
    setMenuAberto(false);
  };

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const resposta = await res.json();
        const data = resposta.data || resposta;

        if (data.imageProfileId) {
          try {
            const resImg = await fetch(
              `http://localhost:8080/api/images/get/${data.imageProfileId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (resImg.ok) {
              const contentType = resImg.headers.get("content-type");

              if (contentType && contentType.includes("application/json")) {
                const respostaImg = await resImg.json();
                if (respostaImg.data) {
                  setFotoPerfil(`data:image/jpeg;base64,${respostaImg.data}`);
                } else {
                  setFotoPerfil("/imagemperfil.jpg");
                }
              } else {
                const blob = await resImg.blob();
                setFotoPerfil(URL.createObjectURL(blob));
              }
            }
          } catch (err) {
            console.error("Erro ao carregar avatar:", err);
            setFotoPerfil("/imagemperfil.jpg");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setFotoPerfil("/imagemperfil.jpg");
      });
  }, [token]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query) {
        navigate(`/busca?query=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center relative">
        <h1
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          ImobLink
        </h1>

        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <input
            type="text"
            placeholder="Buscar..."
            className="border p-2 rounded"
            onKeyDown={handleSearchKeyDown}
          />

          <div className="relative">
            <img
              src={fotoPerfil}
              alt="Perfil"
              onClick={() => setMenuAberto((prev) => !prev)}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-600 hover:scale-105 transition"
            />

            {menuAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={irParaPerfil}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={irParaConfiguracoes}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Configurações
                </button>
                <button
                  onClick={sair}
                  className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 border-t"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white shadow-md p-4 flex flex-col justify-between md:flex">
          <nav className="space-y-4">
            <a
              href="/home"
              className="block text-blue-700 font-semibold hover:text-blue-800 transition"
            >
              Imóveis
            </a>
            <a
              href="/meus-anuncios"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              Meus Anúncios
            </a>

            <a
              href="/conversas"
              className="block text-gray-700 hover:text-blue-600 transition"
            >
              Conversas
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
