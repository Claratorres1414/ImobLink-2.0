import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

function Perfil() {
  const [dadosUsuario, setDadosUsuario] = useState({});
  const [editando, setEditando] = useState(false);
  const [novaBio, setNovaBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:8080/api/user/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const data = await res.json();
        setDadosUsuario(data);
        setNovaBio(data.bio || "");
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, []);

  const salvarBio = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8080/api/user/setInfo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: novaBio }),
      });

      if (res.ok) {
        setDadosUsuario((prev) => ({ ...prev, bio: novaBio }));
        setEditando(false);
      } else {
        alert("Erro ao salvar a bio.");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const deletarConta = async () => {
    const confirmado = confirm("Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.");
    if (!confirmado) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/user/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Conta excluída com sucesso.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Erro ao excluir a conta.");
      }
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-start justify-center bg-slate-100 p-6 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex w-full max-w-4xl">
          {/* Foto de perfil */}
          <div className="w-1/3 flex justify-center items-start">
            <img
              src="/imagemperfil.jpg"
              alt="Foto de perfil"
              className="w-40 h-40 rounded-lg border-2 border-gray-300 object-cover"
            />
          </div>

          {/* Informações */}
          <div className="w-2/3 pl-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{dadosUsuario.name}</h2>
              <p className="text-gray-600">Telefone: {dadosUsuario.phoneNumber}</p>
              <p className="text-gray-600">Email: {dadosUsuario.email}</p>
              <p className="text-gray-600">{dadosUsuario.role}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
                Bio:
                {!editando && (
                  <Pencil
                    size={16}
                    className="cursor-pointer text-gray-500 hover:text-blue-600"
                    onClick={() => setEditando(true)}
                  />
                )}
              </h3>
              {editando ? (
                <>
                  <textarea
                    value={novaBio}
                    onChange={(e) => setNovaBio(e.target.value)}
                    className="w-full border rounded p-2 text-sm bg-gray-50"
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={salvarBio}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setNovaBio(dadosUsuario.bio || "");
                        setEditando(false);
                      }}
                      className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="border border-gray-300 rounded p-3 text-gray-700 bg-gray-50 text-sm">
                  {dadosUsuario.bio || "Sem biografia ainda..."}
                </div>
              )}
            </div>

            <button
              onClick={deletarConta}
              className="flex items-center gap-2 text-red-600 border border-red-500 px-4 py-1 rounded hover:bg-red-100 mt-4"
            >
              <Trash2 size={16} />
              Excluir Conta
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Perfil;
