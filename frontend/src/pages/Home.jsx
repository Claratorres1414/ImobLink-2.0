import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, [token]);

  async function fetchImageForPost(postId, controller) {
    if (!postId) return null;
    const endpoints = [
      `http://localhost:8080/api/images/${postId}/post/thumb`,
      `http://localhost:8080/api/posts/${postId}/image`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        if (!res.ok) continue;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch (err) {
        if (err.name === "AbortError") return null;
      }
    }
    return null;
  }

  useEffect(() => {
    let controller = new AbortController();
    let createdObjectURLs = [];

    fetch("http://localhost:8080/api/feed")
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar publicações");
        const data = await res.json();
        setPosts(data || []);

        for (const p of data || []) {
          const id = p.postId ?? p.id;
          if (!id) continue;
          const imgUrl = await fetchImageForPost(id, controller);
          if (imgUrl) {
            createdObjectURLs.push(imgUrl);
            setImageMap((prev) => ({ ...prev, [id]: imgUrl }));
          } else {
            setImageMap((prev) => ({ ...prev, [id]: "/placeholder.jpg" }));
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar feed:", err));

    return () => {
      controller.abort();
      createdObjectURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [token]);

  const postsFiltrados =
    user && user.name
      ? posts.filter((p) => p.createdBy !== user.name)
      : posts;

  const verDetalhes = (id) => {
    if (!id) return console.error("ID da postagem indefinido!");
    navigate(`/post/${id}`);
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>
      {postsFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhuma publicação encontrada.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsFiltrados.map((post) => {
            const id = post.postId ?? post.id;
            return (
              <div
                key={id}
                onClick={() => verDetalhes(id)}
                className="bg-white shadow rounded overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={imageMap[id] || "/placeholder.jpg"}
                  alt="Imagem do imóvel"
                  className="w-full max-h-64 object-contain rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <div className="p-4 space-y-1">
                  <p className="text-gray-800 font-semibold">{post.description}</p>
                  <p className="text-gray-600 text-sm">Preço: R$ {post.price}</p>
                  <p className="text-gray-600 text-sm">Rua: {post.street}</p>
                  <p className="text-gray-600 text-sm">
                    Bairro: {post.neighborhood ?? post.avenue}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {post.createdAt
                      ? `Publicado em ${format(new Date(post.createdAt), "dd/MM/yyyy")}`
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Home;
