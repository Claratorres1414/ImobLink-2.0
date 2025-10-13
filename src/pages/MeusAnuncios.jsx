import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:8080/api/posts/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar anúncios");
        const data = await res.json();
        console.log("📦 Dados retornados do backend:", data);
        setPosts(data || []);
        setCarregando(false);

        // 🔹 Busca das imagens
        for (const post of data || []) {
          if (!post.id) continue;
          try {
            const imgRes = await fetch(
              `http://localhost:8080/api/images/${post.id}/post`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }
            );
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const url = URL.createObjectURL(blob);
              setImageMap((prev) => ({ ...prev, [post.id]: url }));
            }
          } catch (e) {
            console.warn(`⚠️ Falha ao carregar imagem do post ${post.id}`);
          }
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setErro("Erro ao carregar seus anúncios.");
        setCarregando(false);
      });

    return () => controller.abort();
  }, [token]);

  const handleExcluir = async (postId) => {
    if (!postId) {
      alert("ID da postagem inválido.");
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este anúncio?")) return;

    try {
      const resposta = await fetch(
        `http://localhost:8080/api/posts/delete/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resposta.ok) {
        alert("Anúncio excluído com sucesso!");
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert("Erro ao excluir anúncio.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600">Carregando seus anúncios...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Meus Anúncios</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => navigate("/publicar")}
          >
            Nova Publicação
          </button>
        </div>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {posts.length === 0 ? (
          <p className="text-gray-600">
            Você ainda não publicou nenhum anúncio.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div
                key={post.id ?? `post-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={imageMap[post.id] || "/placeholder.jpg"}
                  alt={post.description || "Imagem do imóvel"}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {post.description || "Sem descrição"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    R$ {post.price ?? "—"} – {post.street ?? "Rua não informada"}, {post.number ?? "S/N"},{" "}
                    {post.neighborhood ?? post.avenue ?? "Bairro não informado"}
                  </p>

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() =>
                        post.id
                          ? navigate(`/editar-postagem/${post.id}`)
                          : alert("ID da postagem inválido")
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(post.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MeusAnuncios;
