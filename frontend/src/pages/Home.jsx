import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [carouselIndex, setCarouselIndex] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const slideIntervals = useRef({});

  // ------------------------------
  // BUSCAR USUÁRIO
  // ------------------------------
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, [token]);

  // ------------------------------
  // BUSCAR TODAS AS IMAGENS DE UM POST
  // ------------------------------
  async function fetchAllImagesForPost(postId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/images/${postId}/post/all`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) return null;

      const images = await res.json();
      const urls = [];

      for (const img of images) {
        try {
          const b = await fetch(
            `http://localhost:8080/api/images/get/${img.id}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if (!b.ok) continue;

          const blob = await b.blob();
          urls.push(URL.createObjectURL(blob));
        } catch {}
      }

      return urls.length ? urls : null;
    } catch {
      return null;
    }
  }

  // ------------------------------
  // CARREGAR FEED
  // ------------------------------
  useEffect(() => {
    let mounted = true;
    const createdObjectURLs = [];

    async function carregar() {
      try {
        const res = await fetch("http://localhost:8080/api/feed");
        if (!res.ok) throw new Error("Erro ao buscar publicações");

        const data = await res.json();
        if (!mounted) return;

        setPosts(data || []);

        for (const post of data || []) {
          const id = post.id;

          // ✅ BUSCAR TODAS AS IMAGENS
          const urls = (await fetchAllImagesForPost(id)) || [];

          if (urls.length > 0) {
            urls.forEach((u) => createdObjectURLs.push(u));
            setImageMap((prev) => ({ ...prev, [id]: urls }));
            setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
          } else {
            // fallback thumb
            try {
              const t = await fetch(
                `http://localhost:8080/api/images/${id}/post/thumb`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              );
              if (t.ok) {
                const blob = await t.blob();
                const u = URL.createObjectURL(blob);
                createdObjectURLs.push(u);
                setImageMap((prev) => ({ ...prev, [id]: [u] }));
                setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
              } else {
                setImageMap((prev) => ({ ...prev, [id]: ["/placeholder.jpg"] }));
              }
            } catch {
              setImageMap((prev) => ({ ...prev, [id]: ["/placeholder.jpg"] }));
            }
          }

          // ✅ LIKES
          setLikedMap((prev) => ({
            ...prev,
            [id]: { count: post.favedTimes ?? 0, liked: false },
          }));

          // ✅ COMENTÁRIOS
          try {
            const cRes = await fetch(
              `http://localhost:8080/api/comments/getComments/${post.userId}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (cRes.ok) {
              const arr = await cRes.json();
              setCommentsCount((prev) => ({ ...prev, [id]: arr.length }));
            } else {
              setCommentsCount((prev) => ({ ...prev, [id]: 0 }));
            }
          } catch {
            setCommentsCount((prev) => ({ ...prev, [id]: 0 }));
          }
        }

        // ✅ MARCAR POSTS FAVORITOS
        if (token) {
          const favsRes = await fetch(
            "http://localhost:8080/api/posts/my-favs",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (favsRes.ok) {
            const favs = await favsRes.json();
            setLikedMap((prev) => {
              const novo = { ...prev };
              favs.forEach((f) => {
                if (novo[f.id]) novo[f.id].liked = true;
              });
              return novo;
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar feed:", err);
      }
    }

    carregar();

    return () => {
      mounted = false;
      Object.values(slideIntervals.current).forEach(clearInterval);
      createdObjectURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [token]);

  // ------------------------------
  // AUTOPLAY DO SLIDER
  // ------------------------------
  useEffect(() => {
    Object.values(slideIntervals.current).forEach(clearInterval);
    slideIntervals.current = {};

    Object.entries(imageMap).forEach(([postId, urls]) => {
      if (!urls || urls.length <= 1) return;

      const intId = setInterval(() => {
        setCarouselIndex((prev) => {
          const cur = prev[postId] ?? 0;
          return { ...prev, [postId]: (cur + 1) % urls.length };
        });
      }, 3000);

      slideIntervals.current[postId] = intId;
    });

    return () => {
      Object.values(slideIntervals.current).forEach(clearInterval);
    };
  }, [imageMap]);

  // ------------------------------
  // LIKE
  // ------------------------------
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
    } catch {
      console.warn("Erro ao curtir");
    }
  }

  const postsFiltrados =
    user && user.name ? posts.filter((p) => p.createdBy !== user.name) : posts;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>

      {postsFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhuma publicação encontrada.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsFiltrados.map((post) => {
            const id = post.id;
            const urls = imageMap[id] || ["/placeholder.jpg"];
            const idx = carouselIndex[id] ?? 0;
            const likeInfo = likedMap[id] || { count: 0, liked: false };
            const commentQty = commentsCount[id] ?? 0;

            return (
              <div
                key={id}
                className="relative bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
              >
                {/* ------------------------------ */}
                {/* SLIDER SUAVE estilo Instagram */}
                {/* ------------------------------ */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                  <div className="relative w-full h-full">
                    {urls.map((u, i) => (
                      <img
                        key={i}
                        src={u}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                          i === idx ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Setinha Esquerda */}
                  {urls.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex((prev) => ({
                          ...prev,
                          [id]: (prev[id] - 1 + urls.length) % urls.length,
                        }));
                      }}
                      className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm"
                    >
                      ❮
                    </button>
                  )}

                  {/* Setinha Direita */}
                  {urls.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex((prev) => ({
                          ...prev,
                          [id]: (prev[id] + 1) % urls.length,
                        }));
                      }}
                      className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm"
                    >
                      ❯
                    </button>
                  )}

                  {/* Bolinhas */}
                  {urls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {urls.map((_, i) => (
                        <div
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCarouselIndex((prev) => ({
                              ...prev,
                              [id]: i,
                            }));
                          }}
                          className={`w-2 h-2 rounded-full cursor-pointer ${
                            i === idx ? "bg-white" : "bg-white/50"
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Likes */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(id);
                    }}
                    className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full text-sm shadow-md transition
                      ${
                        likeInfo.liked
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700"
                      }`}
                  >
                    👍 {likeInfo.count}
                  </button>

                  {/* Comentários */}
                  <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-full text-sm shadow">
                    💬 {commentQty}
                  </div>
                </div>

                {/* INFO DA POSTAGEM */}
                <div
                  onClick={() => navigate(`/post/${id}`)}
                  className="p-4 cursor-pointer space-y-1"
                >
                  <p className="text-gray-800 font-semibold">
                    {post.description}
                  </p>
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
