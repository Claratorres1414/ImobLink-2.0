import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

function Perfil() {
  const [dadosUsuario, setDadosUsuario] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // Carrega dados do usuário
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const data = await res.json();
        setDadosUsuario(data);

        // Se existir imagem de perfil, faz fetch dela
        if (data.imageProfileId) {
          fetch(`http://localhost:8080/api/images/get/${data.imageProfileId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.blob())
            .then((blob) => setFotoPerfil(URL.createObjectURL(blob)))
            .catch(() => setFotoPerfil("/imagemperfil.jpg"));
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-start justify-center bg-slate-100 p-6 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex w-full max-w-4xl">
          {/* Foto de perfil */}
          <div className="w-1/3 flex justify-center items-start">
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-lg border-2 border-gray-300 object-cover"
            />
          </div>

          {/* Informações */}
          <div className="w-2/3 pl-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {dadosUsuario.name}
              </h2>
              <p className="text-gray-600">
                Telefone: {dadosUsuario.phoneNumber || "Não informado"}
              </p>
              <p className="text-gray-600">Email: {dadosUsuario.email}</p>
              <p className="text-gray-600">{dadosUsuario.role}</p>
            </div>

            {/* BIO (somente exibição) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Bio:
              </h3>
              <div className="border border-gray-300 rounded p-3 text-gray-700 bg-gray-50 text-sm">
                {dadosUsuario.bio || "Sem biografia ainda..."}
              </div>
            </div>

            <button
              onClick={() => navigate("/editar-perfil")}
              className="flex items-center gap-2 text-blue-600 border border-blue-500 px-4 py-1 rounded hover:bg-blue-100 mt-4"
            >
              <Pencil size={16} />
              Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Perfil;
