import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState({});
  const slideIntervals = useRef({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [likedMap, setLikedMap] = useState({});
  const [commentsCount, setCommentsCount] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🔹 Buscar todas as imagens do post
  async function fetchAllImagesForPost(postId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/images/${postId}/post/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return null;
      const images = await res.json();
      const urls = [];

      for (const img of images) {
        try {
          const fetchImg = await fetch(
            `http://localhost:8080/api/images/get/${img.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!fetchImg.ok) continue;

          const blob = await fetchImg.blob();
          urls.push(URL.createObjectURL(blob));
        } catch {}
      }

      return urls.length ? urls : null;
    } catch {
      return null;
    }
  }

  // 🔹 Carregar posts do usuário
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

        // Carrega imagens, likes e comentários
        for (const post of data) {
          const urls = (await fetchAllImagesForPost(post.id)) || [];
          setImageMap((prev) => ({ ...prev, [post.id]: urls.length ? urls : ["/placeholder.jpg"] }));
          setCurrentIndex((prev) => ({ ...prev, [post.id]: 0 }));

          // Likes
          setLikedMap((prev) => ({
            ...prev,
            [post.id]: { count: post.likedTimes ?? 0, liked: false },
          }));

          // Comentários
          try {
            const cRes = await fetch(
              `http://localhost:8080/api/comments/getComments/${post.userId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (cRes.ok) {
              const arr = await cRes.json();
              setCommentsCount((prev) => ({ ...prev, [post.id]: arr.length }));
            } else {
              setCommentsCount((prev) => ({ ...prev, [post.id]: 0 }));
            }
          } catch {
            setCommentsCount((prev) => ({ ...prev, [post.id]: 0 }));
          }
        }
      } catch (err) {
        setErro("Erro ao carregar seus anúncios.");
      }

      setCarregando(false);
    }

    carregar();
    return () => controller.abort();
  }, []);

  // 🔹 Autoplay suave
  useEffect(() => {
    Object.values(slideIntervals.current).forEach(clearInterval);
    slideIntervals.current = {};

    Object.entries(imageMap).forEach(([postId, imgs]) => {
      if (imgs.length <= 1) return;
      slideIntervals.current[postId] = setInterval(() => {
        setCurrentIndex((prev) => ({
          ...prev,
          [postId]: (prev[postId] + 1) % imgs.length,
        }));
      }, 3500);
    });

    return () => {
      Object.values(slideIntervals.current).forEach(clearInterval);
    };
  }, [imageMap]);

  // 🔹 Navegação manual
  const next = (postId) => {
    const imgs = imageMap[postId];
    if (!imgs) return;
    setCurrentIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % imgs.length,
    }));
  };

  const prev = (postId) => {
    const imgs = imageMap[postId];
    if (!imgs) return;
    setCurrentIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + imgs.length) % imgs.length,
    }));
  };

  // 🔹 Excluir postagem
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

  // 🔹 Carregando
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
            {posts.map((post) => {
              const imgs = imageMap[post.id] || ["/placeholder.jpg"];
              const idx = currentIndex[post.id] ?? 0;
              const likeInfo = likedMap[post.id] || { count: 0, liked: false };
              const commentQty = commentsCount[post.id] ?? 0;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow overflow-hidden relative"
                >
                  {/* 🖼️ Slider suave */}
                  <div className="relative w-full h-48 overflow-hidden">
                    {imgs.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                          i === idx ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ))}

                    {/* Setas */}
                    {imgs.length > 1 && (
                      <>
                        <button
                          onClick={() => prev(post.id)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded-full hover:bg-black/50"
                        >
                          ❮
                        </button>
                        <button
                          onClick={() => next(post.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white px-2 py-1 rounded-full hover:bg-black/50"
                        >
                          ❯
                        </button>
                      </>
                    )}

                    {/* Bolinhas */}
                    {imgs.length > 1 && (
                      <div className="absolute bottom-2 w-full flex justify-center gap-2">
                        {imgs.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i === idx ? "bg-white" : "bg-white/40"
                            }`}
                          ></div>
                        ))}
                      </div>
                    )}

                    {/* ⭐ Favoritado */}
                    {likeInfo.liked && (
                      <div className="absolute top-2 right-2 text-yellow-400 text-xl drop-shadow">
                        ⭐
                      </div>
                    )}

                    {/* 🏷️ Tipo da postagem */}
                    {post.type && (
                      <div
                        className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xx font-semibold ${
                          post.type.toLowerCase() === "aluguel"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {post.type}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{post.description}</h3>
                    <p className="text-gray-600">
                      R$ {post.price} – {post.street}, {post.number}
                    </p>

                    {/* Indicadores */}
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>👍 {likeInfo.count}</span>
                      <span>💬 {commentQty}</span>
                    </div>

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
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MeusAnuncios;
