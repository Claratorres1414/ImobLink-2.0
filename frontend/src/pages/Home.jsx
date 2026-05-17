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
  const [favoriteMap, setFavoriteMap] = useState({});
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);
  const [commentsCount, setCommentsCount] = useState({});
 
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
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
      .then((data) => setUser(data.data || data))
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
        navigate("/questionnaire");
        return;
      }

      setQuestionnaireCompleted(true);
    } catch (error) {
      console.error("Erro ao verificar questionário:", error);
    } finally {
      setCheckingQuestionnaire(false);
    }
  }

  checkQuestionnaireStatus();
}, [token, navigate]);
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

    const data = await res.json();

    const images =
      data?.data ??
      data?.images ??
      (Array.isArray(data) ? data : []);

    const urls = [];

    for (const img of images) {
      try {
        const imgRes = await fetch(
          `http://localhost:8080/api/images/get/${img.id ?? img}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (!imgRes.ok) continue;

        const contentType = imgRes.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const json = await imgRes.json();
          if (json?.data) {
            urls.push(`data:image/jpeg;base64,${json.data}`);
          }
        } else {
          const blob = await imgRes.blob();
          const url = URL.createObjectURL(blob);
          urls.push(url);
        }
      } catch (err) {
        console.log("Erro imagem:", err);
      }
    }

    return urls.length ? urls : null;
  } catch (err) {
    console.log("Erro fetch images:", err);
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
      if (!user?.id) return;
      try {
        let recommended = [];
        let normalFeed = [];

        // -------------------------
        // RECOMENDADOS
        // -------------------------
        try {
          const recRes = await fetch(
            "http://localhost:8080/api/posts/recommendations",
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          if (recRes.ok) {
            const recResponse = await recRes.json();
            recommended = recResponse.data || recResponse || [];
          } else {
            console.log("Recomendações indisponíveis. Carregando feed normal.");
            recommended = [];
          }
        } catch (err) {
          console.log("FastAPI offline. Exibindo apenas feed normal.");
          recommended = [];
        }

        // -------------------------
        // FEED NORMAL
        // -------------------------
        try {
          const feedRes = await fetch("http://localhost:8080/api/feed");
          const feedData = await feedRes.json();
          normalFeed = feedData.data || feedData || [];
        } catch (err) {
          console.error("Erro feed:", err);
        }

        // -------------------------
        // MERGE (RECOMENDADOS + FEED)
        // -------------------------
        const displayedRecommended = questionnaireCompleted
          ? recommended
              .filter(
                (p) =>
                  Number(p.userId) !== Number(user.id) &&
                  !Boolean(p.wasLiked)
              )
              .slice(0, 5)
          : [];

        const recommendedIds = new Set(
          displayedRecommended.map((p) => p.id)
        );

        const finalPosts = [
          ...displayedRecommended.map((p) => ({
            ...p,
            _source: "recommended",
          })),

          ...normalFeed
            .filter(
              (p) =>
                Number(p.userId) !== Number(user.id) &&
                !recommendedIds.has(p.id)
            )
            .map((p) => ({
              ...p,
              _source: "feed",
            })),
        ];

        setPosts(finalPosts);

        // -------------------------
        // CARREGAMENTO DE IMAGENS + DADOS
        // -------------------------
        for (const post of finalPosts) {
          const id = post.id;

          const urls = (await fetchAllImagesForPost(id)) || [];

          if (urls.length > 0) {
            urls.forEach((u) => createdObjectURLs.push(u));
            setImageMap((prev) => ({
              ...prev,
              [id]: urls.length ? urls : ["/placeholder.jpg"],
            }));
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

          // -------------------------
          // LIKES
          // -------------------------
          setLikedMap((prev) => ({
            ...prev,
            [id]: {
              count: post.likedTimes ?? 0,
              liked: prev[id]?.liked ?? Boolean(post.wasLiked),
            },
          }));

          // -------------------------
          // COMMENTS
          // -------------------------
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

        // -------------------------
        // FAVORITOS
        // -------------------------
        if (token) {
          // likes
          const likesRes = await fetch(
            "http://localhost:8080/api/posts/my-likes",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (likesRes.ok) {
            const response = await likesRes.json();
            const likes = response.data || response || [];

            const likedSet = new Set(likes.map((p) => p.id));

            setLikedMap((prev) => {
              const novo = { ...prev };

              Object.keys(novo).forEach((id) => {
                novo[id] = {
                  ...novo[id],
                  liked: likedSet.has(Number(id)),
                };
              });

              return novo;
            });
          }

          // favoritos
          const favsRes = await fetch(
            "http://localhost:8080/api/posts/my-favs",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (favsRes.ok) {
            const favsResponse = await favsRes.json();
            const favs = favsResponse.data || favsResponse || [];

            const favSet = new Set(favs.map((p) => p.id));

           setFavoriteMap(() => {
              const novo = {};

              favSet.forEach((id) => {
                novo[id] = true;
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
  }, [token, user]);

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

  const postsFiltrados = posts;
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
        setFavoriteMap((prev) => ({
          ...prev,
          [postId]: !favoritado,
        }));

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _source: "feed",
                }
              : post
          )
        );
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
        setLikedMap((prev) => ({
          ...prev,
          [postId]: {
            liked: !liked,
            count: liked
              ? prev[postId].count - 1
              : prev[postId].count + 1,
          },
        }));

        // remove recomendação quando interagir
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _source: "feed",
                }
              : post
          )
        );
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

  if (checkingQuestionnaire) {
    return <div>Carregando...</div>;
  }
  return (
    <div
      key={id}
      className="relative bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
    >
      {/* IMAGEM */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <div className="relative w-full h-full">
          {urls.map((u, i) => (
            <img
              key={i}
              src={u}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {post._source === "recommended" && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
            Recomendado
          </div>
        )}

        {post.type && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {post.type}
          </div>
        )}
      </div>

      {/* INFO */}
      <div
        onClick={() => navigate(`/post/${id}`)}
        className="p-4 cursor-pointer space-y-1"
      >
        <p className="font-semibold">{post.description}</p>
        <p className="text-sm text-gray-600">R$ {post.price}</p>
        <p className="text-sm text-gray-600">
          {post.street}, {post.number}
        </p>

        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-gray-500">
              <span className="text-xl">👍</span>
              <span className="text-sm">
                {post.likedTimes ?? post.likes ?? post.likedCount ?? 0}
              </span>
            </div>
          </div>

          <span className="text-sm text-gray-500">
            💬 {commentQty}
          </span>
        </div>
      </div>
    </div>
  );
};
  // ------------------------------
  // RENDERIZAÇÃO
  // ------------------------------
  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>

      {/* =========================
          🔥 RECOMENDADOS
      ========================= */}
      {questionnaireCompleted &&
        postsFiltrados.some((p) => p._source === "recommended") && (
        <>
          <h3 className="text-xl font-bold mb-4 text-purple-600">
            Recomendados para você
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {postsFiltrados
              .filter((p) => p._source === "recommended")
              .map((post) => renderCard(post))}
          </div>
        </>
      )}

      {/* =========================
          🌍 FEED NORMAL
      ========================= */}
      <h3 className="text-xl font-bold mb-4">Explorar imóveis</h3>

      {questionnaireCompleted && postsFiltrados.filter((p) => p._source !== "recommended").length === 0 ? (
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
