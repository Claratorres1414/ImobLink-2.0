import { useNavigate } from "react-router-dom";

function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const sair = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const irParaPerfil = () => {
    navigate("/perfil");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Topo */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">ImobLink</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar imóveis..."
            className="border p-2 rounded"
          />
          <img
            src="/imagemperfil.jpg"
            alt="Perfil"
            onClick={irParaPerfil}
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-600 hover:scale-105 transition"
          />
        </div>
      </header>

      {/* Conteúdo com menu + principal */}
      <div className="flex flex-1">
        {/* Menu lateral */}
        <aside className="w-64 bg-white shadow-md p-4 flex flex-col justify-between md:flex">
          <nav className="space-y-4">
            <a href="/home" className="block text-blue-700 font-semibold">Imóveis</a>
            <a href="/meus-anuncios" className="block text-gray-700">Meus Anúncios</a>
          </nav>
          <button
            onClick={sair}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-6"
          >
            Sair
          </button>
        </aside>

        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
