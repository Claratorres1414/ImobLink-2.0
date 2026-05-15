import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Questionnaire from "../components/Questionnaire";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [carouselIndex, setCarouselIndex] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
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
  // VER SE QUESTIONÁRIO FOI RESPONDIDO
  // ------------------------------ 
  useEffect(() => {
  async function checkQuestionnaireStatus() {
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8080/api/posts/questionnaire/status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.completed) {
        setShowQuestionnaire(true);
      } else {
        setShowQuestionnaire(false);
      }
    } catch (error) {
      console.error("Erro ao verificar questionário:", error);
      setShowQuestionnaire(false);
    }
  }

  checkQuestionnaireStatus();
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
        let recRes = await fetch(
          "http://localhost:8080/api/posts/recommendations",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        let recData = await recRes.json();
        let recommended = recData.data || [];

        let feedRes = await fetch("http://localhost:8080/api/feed");
        let feedData = await feedRes.json();
        let normalFeed = feedData.data || feedData;

        // mistura estilo Instagram/TikTok
        const finalPosts = [
          ...recommended.slice(0, 5),
          ...normalFeed.filter(p => !recommended.find(r => r.id === p.id))
        ];

        setPosts(finalPosts);
        if (!res.ok) throw new Error("Erro ao buscar publicações");

        const data = await res.json();
        if (!mounted) return;

        setPosts(data || []);

        for (const post of data || []) {
          const id = post.id;
          const urls = (await fetchAllImagesForPost(id)) || [];

          if (urls.length > 0) {
            urls.forEach((u) => createdObjectURLs.push(u));
            setImageMap((prev) => ({ ...prev, [id]: urls }));
            setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
          } else {
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
                setImageMap((prev) => ({
                  ...prev,
                  [id]: ["/placeholder.jpg"],
                }));
              }
            } catch {
              setImageMap((prev) => ({
                ...prev,
                [id]: ["/placeholder.jpg"],
              }));
            }
          }

          // Likes
          setLikedMap((prev) => ({
            ...prev,
            [id]: { count: post.likedTimes ?? 0, liked: false },
          }));

          // Comentários
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

        // Favoritos
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

  const postsFiltrados =
    user && user.name ? posts.filter((p) => p.createdBy !== user.name) : posts;
  const handleQuestionnaireSubmit = async (data) => {
    try {
      await fetch("http://localhost:8080/api/posts/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      setShowQuestionnaire(false);
    } catch (error) {
      console.error("Erro ao salvar questionário:", error);
    }
  };

  const handleSkipQuestionnaire = async () => {
    try {
      await fetch("http://localhost:8080/api/posts/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: null,
          propertyType: null,
          priceRange: null,
        }),
      });

      setShowQuestionnaire(false);
    } catch (error) {
      console.error("Erro ao pular questionário:", error);
    }
  };

  // ------------------------------
  // RENDERIZAÇÃO
  // ------------------------------
  return (
    <DashboardLayout>
      {showQuestionnaire && (
        <Questionnaire
          onSubmit={handleQuestionnaireSubmit}
          onSkip={handleSkipQuestionnaire}
        />
      )}
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
                {/* Slider suave */}
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

                  {/* Setas e bolinhas */}
                  {urls.length > 1 && (
                    <>
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
                    </>
                  )}

                  {/* ⭐ Indicador de favorito */}
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

                {/* Conteúdo abaixo da imagem */}
                <div
                  onClick={() => navigate(`/post/${id}`)}
                  className="p-4 cursor-pointer space-y-1"
                >
                  <p className="text-gray-800 font-semibold">
                    {post.description}
                  </p>
                  <p className="text-gray-600 text-sm">Preço: R$ {post.price}</p>
                  <p className="text-gray-600 text-sm">
                    {post.street}, {post.number}
                  </p>

                  {/* Indicadores fora da imagem */}
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                    <span>👍 {likeInfo.count}</span>
                    <span>💬 {commentQty}</span>
                  </div>

                  <p className="text-gray-400 text-xs mt-1">
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
