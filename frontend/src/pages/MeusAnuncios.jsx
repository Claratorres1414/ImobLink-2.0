import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const res = await fetch("http://localhost:8080/api/posts/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Erro ao carregar posts");

        const data = await res.json();
        setPosts(data);

        // ✅ Buscar miniaturas
        for (const p of data) {
          try {
            const img = await fetch(
              `http://localhost:8080/api/images/${p.id}/post/thumb`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (img.ok) {
              const blob = await img.blob();
              const url = URL.createObjectURL(blob);
              setImageMap((prev) => ({ ...prev, [p.id]: url }));
            }
          } catch {}
        }
      } catch (err) {
        setErro("Erro ao carregar seus anúncios.");
      }

      setCarregando(false);
    }

    carregar();
    return () => controller.abort();
  }, []);

  async function handleExcluir(id) {
    if (!window.confirm("Excluir este anúncio?")) return;

    const res = await fetch(`http://localhost:8080/api/posts/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Post excluído!");
      setPosts((p) => p.filter((x) => x.id !== id));
    }
  }

  if (carregando) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600">Carregando...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Anúncios</h2>
          <button
            onClick={() => navigate("/publicar")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Nova Publicação
          </button>
        </div>

        {posts.length === 0 ? (
          <p>Você ainda não publicou nada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden relative">

                {/* ✅ Miniatura */}
                <div className="relative">
                  <img
                    src={imageMap[post.id] || "/placeholder.jpg"}
                    className="w-full h-48 object-cover"
                  />

                  {/* ✅ Badge de Likes */}
                  <div className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 rounded-full shadow flex items-center gap-1">
                    <span className="text-blue-600 text-lg">👍</span>
                    <span className="font-semibold text-gray-800">
                      {post.favedTimes}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg">{post.description}</h3>
                  <p className="text-gray-600">
                    R$ {post.price} – {post.street}, {post.number}
                  </p>

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/editar-postagem/${post.id}`)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleExcluir(post.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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
