import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Buscar dados do usuário (para filtrar posts dele e saber favoritos)
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, [token]);

  // ✅ Buscar imagem
  async function fetchImageForPost(postId, controller) {
    if (!postId) return null;

    const endpoints = [
      `http://localhost:8080/api/images/${postId}/post/thumb`,
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

  // ✅ Buscar posts + imagens + likes
  useEffect(() => {
    let controller = new AbortController();
    let createdObjectURLs = [];

    async function carregar() {
      try {
        const res = await fetch("http://localhost:8080/api/feed");

        if (!res.ok) throw new Error("Erro ao buscar publicações");

        const data = await res.json();
        setPosts(data || []);

        // ✅ Carregar imagem + salvar
        for (const post of data || []) {
          const id = post.id;

          const imgUrl = await fetchImageForPost(id, controller);

          if (imgUrl) {
            createdObjectURLs.push(imgUrl);
            setImageMap((prev) => ({ ...prev, [id]: imgUrl }));
          } else {
            setImageMap((prev) => ({ ...prev, [id]: "/placeholder.jpg" }));
          }

          // ✅ Salvar likes
          setLikedMap((prev) => ({
            ...prev,
            [id]: {
              count: post.favedTimes,
              liked: false,
            },
          }));
        }

        // ✅ Buscar favoritos do usuário (para marcar os já curtidos)
        const favsRes = await fetch("http://localhost:8080/api/posts/my-favs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (favsRes.ok) {
          const favoritos = await favsRes.json();

          setLikedMap((prev) => {
            const novo = { ...prev };
            favoritos.forEach((f) => {
              if (novo[f.id]) novo[f.id].liked = true;
            });
            return novo;
          });
        }
      } catch (err) {
        console.error("Erro ao carregar feed:", err);
      }
    }

    carregar();

    return () => {
      controller.abort();
      createdObjectURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [token]);

  // ✅ Like
  async function toggleLike(postId) {
    const atual = likedMap[postId];
    if (!atual) return;

    const endpoint = atual.liked
      ? `http://localhost:8080/api/posts/unfav/${postId}`
      : `http://localhost:8080/api/posts/fav/${postId}`;

    const method = atual.liked ? "DELETE" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLikedMap((prev) => ({
          ...prev,
          [postId]: {
            liked: !atual.liked,
            count: atual.count + (atual.liked ? -1 : +1),
          },
        }));
      }
    } catch (e) {
      console.error("Erro ao curtir/descurtir:", e);
    }
  }

  // ✅ Ocultar posts do próprio usuário
  const postsFiltrados =
    user && user.name
      ? posts.filter((p) => p.createdBy !== user.name)
      : posts;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>

      {postsFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhuma publicação encontrada.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsFiltrados.map((post) => {
            const id = post.id;
            const likeInfo = likedMap[id] || { count: 0, liked: false };

            return (
              <div
                key={id}
                className="relative bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
              >
                {/* ✅ Miniatura */}
                <img
                  src={imageMap[id]}
                  alt="Imagem do imóvel"
                  className="w-full max-h-64 object-contain bg-gray-100"
                />

                {/* ✅ Ícone de Like estilo YouTube */}
                <button
                  onClick={() => toggleLike(id)}
                  className={`absolute top-2 right-2 flex items-center gap-1 px-3 py-1 rounded-full shadow-md text-sm transition 
                    ${
                      likeInfo.liked
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700"
                    }`}
                >
                  👍 {likeInfo.count}
                </button>

                {/* ✅ Conteúdo */}
                <div
                  onClick={() => navigate(`/post/${id}`)}
                  className="p-4 cursor-pointer space-y-1"
                >
                  <p className="text-gray-800 font-semibold">{post.description}</p>
                  <p className="text-gray-600 text-sm">Preço: R$ {post.price}</p>
                  <p className="text-gray-600 text-sm">Rua: {post.street}</p>

                  <p className="text-gray-400 text-xs mt-2">
                    {post.createdAt
                      ? `Publicado em ${format(
                          new Date(post.createdAt),
                          "dd/MM/yyyy"
                        )}`
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
