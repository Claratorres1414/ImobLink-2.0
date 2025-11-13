import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

function Perfil() {
  const [dadosUsuario, setDadosUsuario] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const [favoritos, setFavoritos] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // ✅ Carregar dados do usuário
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const data = await res.json();
        setDadosUsuario(data);

        // ✅ Carregar imagem de perfil
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
  }, [navigate, token]);

  // ✅ Buscar posts favoritados
  useEffect(() => {
    async function carregarFavoritos() {
      try {
        const res = await fetch("http://localhost:8080/api/posts/my-favs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar favoritos");

        const data = await res.json();
        setFavoritos(data);

        // ✅ Buscar imagem de capa de cada post
        for (const post of data) {
          try {
            const imgRes = await fetch(
              `http://localhost:8080/api/images/${post.id}/post/thumb`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const url = URL.createObjectURL(blob);
              setImageMap((prev) => ({ ...prev, [post.id]: url }));
            } else {
              setImageMap((prev) => ({ ...prev, [post.id]: "/placeholder.jpg" }));
            }
          } catch {
            setImageMap((prev) => ({ ...prev, [post.id]: "/placeholder.jpg" }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }

    carregarFavoritos();
  }, [token]);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col items-center bg-slate-100 p-6 mt-8 space-y-8">

        {/* 🧍 Perfil principal */}
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

            {/* Bio */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio:</h3>
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

        {/* ⭐ Favoritos */}
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Publicações Favoritadas
          </h3>

          {favoritos.length === 0 ? (
            <p className="text-gray-600 text-center">
              Você ainda não favoritou nenhuma publicação.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoritos.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="cursor-pointer bg-white border rounded-xl shadow hover:shadow-md transition overflow-hidden"
                >
                  {/* Imagem */}
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={imageMap[post.id] || "/placeholder.jpg"}
                      alt={post.description}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Tipo da postagem */}
                    {post.type && (
                      <div
                        className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          post.type.toLowerCase() === "aluguel"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {post.type}
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="p-3 space-y-1">
                    <p className="font-semibold text-gray-800 line-clamp-2">
                      {post.description}
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      R$ {post.price} — {post.street}, {post.avenue}
                    </p>
                    <p className="text-xs text-gray-400">
                      Publicado em {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Perfil;
