import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatarPreco, formatarEndereco } from "../utils/formatters";
import PostTags from "../components/PostTags";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [carouselIndex, setCarouselIndex] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [favoriteMap, setFavoriteMap] = useState({});
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);
  const [commentsCount, setCommentsCount] = useState({});
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const slideIntervals = useRef({});

  // 1. FUNÇÃO ASSÍNCRONA PARA BUSCAR IMAGENS DE UM POST
  async function fetchAllImagesForPost(postId) {
    try {
      const res = await fetch(`http://localhost:8080/api/images/${postId}/post/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return null;

      const contentType = res.headers.get("content-type");
      const urls = [];

      if (contentType && contentType.includes("application/json")) {
        const resposta = await res.json();
        const images = Array.isArray(resposta?.data)
          ? resposta.data
          : Array.isArray(resposta)
          ? resposta
          : [];

        images.forEach((img) => {
          if (img.data) {
            urls.push(`data:image/jpeg;base64,${img.data}`);
          } else if (typeof img === "string") {
            urls.push(img);
          }
        });
      } else {
        const blob = await res.blob();
        urls.push(URL.createObjectURL(blob));
      }

      return urls.length ? urls : null;
    } catch (err) {
      console.error("Erro fetch images:", err);
      return null;
    }
  }

  // 2. FLUXO UNIFICADO: USUÁRIO -> STATUS QUESTIONÁRIO -> CARREGAR FEEDS
  useEffect(() => {
    let mounted = true;
    const createdObjectURLs = [];

    async function inicializarDashboard() {
      if (!token) return;

      try {
        setCheckingQuestionnaire(true);

        // PASSO A: Buscar dados da conta do usuário
        const userRes = await fetch("http://localhost:8080/api/user/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Erro ao buscar usuário");
        const userData = await userRes.json();
        const perfilUsuario = userData.data || userData;
        
        if (mounted) setUser(perfilUsuario);

        // PASSO B: Chamar o endpoint correto do seu Controller Java para checar o status
        const statusRes = await fetch("http://localhost:8080/api/posts/questionnaire/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!statusRes.ok) throw new Error("Erro ao verificar status do questionário");
        const statusData = await statusRes.json(); // Retorna {"completed": true/false}

        // Se a conta for nova ou não respondeu, interrompe e redireciona
        if (!statusData.completed) {
          if (mounted) {
            setQuestionnaireCompleted(false);
            setCheckingQuestionnaire(false);
          }
          navigate("/questionnaire");
          return; 
        }

        if (mounted) setQuestionnaireCompleted(true);

        // PASSO C: Se o questionário está ok, busca as listas de publicações
        let recommended = [];
        let normalFeed = [];

        // Buscar Recomendados (Spring Boot + FastAPI)
        try {
          const recRes = await fetch("http://localhost:8080/api/posts/recommendations", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (recRes.ok) {
            const recResponse = await recRes.json();
            recommended = recResponse.data || recResponse || [];
          }
        } catch (err) {
          console.log("FastAPI offline ou erro nas recomendações. Usando feed alternativo.");
        }

        // Buscar Feed Geral
        try {
          const feedRes = await fetch("http://localhost:8080/api/feed");
          if (feedRes.ok) {
            const feedData = await feedRes.json();
            normalFeed = feedData.data || feedData || [];
          }
        } catch (err) {
          console.error("Erro ao buscar feed geral:", err);
        }

        if (!mounted) return;

        // Ocultar os posts gerados pelo próprio usuário logado
        const currentUserId = perfilUsuario.id;
        const displayedRecommended = recommended
          .filter((p) => Number(p.userId) !== Number(currentUserId) && !p.wasLiked)
          .slice(0, 5);

        const recommendedIds = new Set(displayedRecommended.map((p) => p.id));

        const finalPosts = [
          ...displayedRecommended.map((p) => ({ ...p, _source: "recommended" })),
          ...normalFeed
            .filter((p) => Number(p.userId) !== Number(currentUserId) && !recommendedIds.has(p.id))
            .map((p) => ({ ...p, _source: "feed" })),
        ];

        setPosts(finalPosts);

        // PASSO D: Processar mídias, curtidas e comentários por card gerado
        for (const post of finalPosts) {
          const id = post.id;
          const urls = (await fetchAllImagesForPost(id)) || [];

          if (urls.length > 0) {
            urls.forEach((u) => {
              if (u.startsWith("blob:")) createdObjectURLs.push(u);
            });
            if (mounted) {
              setImageMap((prev) => ({ ...prev, [id]: urls }));
              setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
            }
          } else {
            try {
              const t = await fetch(`http://localhost:8080/api/images/${id}/post/thumb`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (t.ok && mounted) {
                const contentType = t.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  const respostaThumb = await t.json();
                  if (respostaThumb.data) {
                    setImageMap((prev) => ({
                      ...prev,
                      [id]: [`data:image/jpeg;base64,${respostaThumb.data}`],
                    }));
                  } else {
                    setImageMap((prev) => ({ ...prev, [id]: ["/placeholder.jpg"] }));
                  }
                } else {
                  const blob = await t.blob();
                  const u = URL.createObjectURL(blob);
                  createdObjectURLs.push(u);
                  setImageMap((prev) => ({ ...prev, [id]: [u] }));
                }
                setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
              } else if (mounted) {
                setImageMap((prev) => ({ ...prev, [id]: ["/placeholder.jpg"] }));
              }
            } catch {
              if (mounted) setImageMap((prev) => ({ ...prev, [id]: ["/placeholder.jpg"] }));
            }
          }

          if (mounted) {
            setLikedMap((prev) => ({
              ...prev,
              [id]: {
                count: post.likedTimes ?? 0,
                liked: prev[id]?.liked ?? Boolean(post.wasLiked),
              },
            }));
          }

          try {
            const cRes = await fetch(`http://localhost:8080/api/comments/getComments/post/${post.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (cRes.ok && mounted) {
              const respostaComentarios = await cRes.json();
              const arr = respostaComentarios?.data || respostaComentarios || [];
              setCommentsCount((prev) => ({ ...prev, [id]: Array.isArray(arr) ? arr.length : 0 }));
            }
          } catch {
            if (mounted) setCommentsCount((prev) => ({ ...prev, [id]: 0 }));
          }
        }

        // PASSO E: Sincronizar Likes e Favoritos globais da conta logada
        try {
          const likesRes = await fetch("http://localhost:8080/api/posts/my-likes", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (likesRes.ok && mounted) {
            const response = await likesRes.json();
            const likes = response.data || response || [];
            const likedSet = new Set(likes.map((p) => p.id));
            setLikedMap((prev) => {
              const novo = { ...prev };
              Object.keys(novo).forEach((id) => {
                novo[id] = { ...novo[id], liked: likedSet.has(Number(id)) };
              });
              return novo;
            });
          }

          const favsRes = await fetch("http://localhost:8080/api/posts/my-favs", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (favsRes.ok && mounted) {
            const favsResponse = await favsRes.json();
            const favs = favsResponse.data || favsResponse || [];
            const favSet = new Set(favs.map((p) => p.id));
            setFavoriteMap(() => {
              const novo = {};
              favSet.forEach((id) => { novo[id] = true; });
              return novo;
            });
          }
        } catch (err) {
          console.error("Erro ao sincronizar interações:", err);
        }

      } catch (err) {
        console.error("Erro na inicialização geral da Home:", err);
      } finally {
        if (mounted) setCheckingQuestionnaire(false);
      }
    }

    inicializarDashboard();

    return () => {
      mounted = false;
      Object.values(slideIntervals.current).forEach(clearInterval);
      createdObjectURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [token, navigate]);

  // 3. AUTOPLAY DO SLIDER
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

  const postsSeguros = Array.isArray(posts) ? posts : [];
  const postsFiltrados =
    user && user.id
      ? postsSeguros.filter((p) => (p.createdById ?? p.userId) !== user.id)
      : postsSeguros;

  async function toggleFavorite(postId) {
    const favoritado = favoriteMap[postId];
    const endpoint = favoritado
      ? `http://localhost:8080/api/posts/unfav/${postId}`
      : `http://localhost:8080/api/posts/fav/${postId}`;
    const method = favoritado ? "DELETE" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavoriteMap((prev) => ({ ...prev, [postId]: !favoritado }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleLike(postId) {
    const liked = likedMap[postId]?.liked;
    const endpoint = liked
      ? `http://localhost:8080/api/posts/unlike/${postId}`
      : `http://localhost:8080/api/posts/like/${postId}`;
    const method = liked ? "DELETE" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        // 1. Atualiza o ícone e o contador de likes
        setLikedMap((prev) => ({
          ...prev,
          [postId]: {
            liked: !liked,
            count: liked ? prev[postId].count - 1 : prev[postId].count + 1,
          },
        }));

        // 2. Se o usuário acabou de dar LIKE (não estava curtido),
        // transformamos o _source dele em "feed" para ele sair dos Recomendados na hora
        if (!liked) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, _source: "feed" } : post
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const renderCard = (post) => {
    const id = post.id;
    const urls = imageMap[id] || ["/placeholder.jpg"];
    const idx = carouselIndex[id] ?? 0;
    const likeInfo = likedMap[id] || { count: 0, liked: false };
    const commentQty = commentsCount[id] ?? 0;
    const isFavorite = favoriteMap[id] ?? false;

    return (
      <div
        key={id}
        className="relative bg-white shadow rounded overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
      >
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <div className="relative w-full h-full" onClick={() => navigate(`/post/${id}`)}>
            {urls.map((u, i) => (
              <img
                key={i}
                src={u}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === idx ? "opacity-100" : "opacity-0"
                }`}
                alt="Imóvel"
              />
            ))}
          </div>

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
                className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm z-10"
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
                className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/40 text-white rounded-full px-2 py-1 text-sm z-10"
              >
                ❯
              </button>
            </>
          )}

          {post._source === "recommended" && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded z-10">
              Recomendado
            </div>
          )}

          {post.type && (
            <div
              className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold z-10 ${
                post.type.toLowerCase() === "aluguel" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {post.type}
            </div>
          )}

          {isFavorite && (
            <div className="absolute top-2 right-12 text-yellow-400 text-xl drop-shadow z-10">
              ⭐
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div onClick={() => navigate(`/post/${id}`)} className="cursor-pointer space-y-1">
            <p className="font-semibold text-gray-800 line-clamp-2">{post.description}</p>
            <p className="text-blue-700 text-lg font-bold">{formatarPreco(post.price)}</p>
            
            {(() => {
              const endereco = formatarEndereco(post.street, post.number, post.avenue);
              return (
                <div className="text-sm text-gray-600">
                  <p>{endereco.linha1}</p>
                  <p>{endereco.linha2}</p>
                </div>
              );
            })()}

            <PostTags tags={post.tags} />
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <div className="flex gap-4">
              <button 
                onClick={() => toggleLike(id)} 
                className={`flex items-center gap-1 hover:text-blue-600 transition ${likeInfo.liked ? "text-blue-600 font-bold" : ""}`}
              >
                👍 {likeInfo.count}
              </button>
              <button 
                onClick={() => toggleFavorite(id)} 
                className={`flex items-center gap-1 hover:text-yellow-500 transition ${isFavorite ? "text-yellow-500 font-bold" : ""}`}
              >
                ⭐ Favorito
              </button>
            </div>
            <span>💬 {commentQty}</span>
          </div>

          <p className="text-gray-400 text-xxs pt-1">
            {post.createdAt ? `Publicado em ${format(new Date(post.createdAt), "dd/MM/yyyy")}` : ""}
          </p>
        </div>
      </div>
    );
  };

  if (checkingQuestionnaire && postsFiltrados.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-500 animate-pulse">Carregando publicações...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>

      {/* 🔥 RECOMENDADOS */}
      {questionnaireCompleted && postsFiltrados.some((p) => p._source === "recommended") && (
        <>
          <h3 className="text-xl font-bold mb-4 text-purple-600">Recomendados para você</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {postsFiltrados
              .filter((p) => p._source === "recommended")
              .map((post) => renderCard(post))}
          </div>
        </>
      )}

      {/* 🌍 FEED NORMAL */}
      <h3 className="text-xl font-bold mb-4">Explorar imóveis</h3>
      {postsFiltrados.filter((p) => p._source !== "recommended").length === 0 ? (
        <p className="text-gray-600">Nenhuma publicação encontrada.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postsFiltrados
            .filter((p) => p._source !== "recommended")
            .map((post) => renderCard(post))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Home;