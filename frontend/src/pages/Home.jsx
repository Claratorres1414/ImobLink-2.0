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
  const [commentsCount, setCommentsCount] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const slideIntervals = useRef({});

  
  // BUSCAR USUÁRIO
  
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.data || data))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, [token]);

  
  // BUSCAR TODAS AS IMAGENS DE UM POST
  
  async function fetchAllImagesForPost(postId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/images/${postId}/post/all`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) return null;

      const resposta = await res.json();
      const images = Array.isArray(resposta?.data)
        ? resposta.data
        : Array.isArray(resposta)
        ? resposta
        : [];

      const urls = [];

      for (const img of images) {
        try {
          const b = await fetch(
            `http://localhost:8080/api/images/get/${img.id}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if (!b.ok) continue;

          const contentType = b.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const respostaImg = await b.json();
            if (respostaImg.data) {
              urls.push(`data:image/jpeg;base64,${respostaImg.data}`);
            }
          } else {
            const blob = await b.blob();
            urls.push(URL.createObjectURL(blob));
          }
        } catch {}
      }

      return urls.length ? urls : null;
    } catch {
      return null;
    }
  }

  
  // CARREGAR FEED

  useEffect(() => {
    let mounted = true;
    const createdObjectURLs = [];

    async function carregar() {
      try {
        const res = await fetch("http://localhost:8080/api/feed");
        if (!res.ok) throw new Error("Erro ao buscar publicações");

        const data = await res.json();
        console.log("Resposta do /api/feed:", data);
        if (!mounted) return;

        const listaPosts = Array.isArray(data?.data) ? data.data : [];

        setPosts(listaPosts);

        for (const post of listaPosts) {
          const id = post.id;
          const urls = (await fetchAllImagesForPost(id)) || [];

          if (urls.length > 0) {
            urls.forEach((u) => {
              if (u.startsWith("blob:")) createdObjectURLs.push(u);
            });
            setImageMap((prev) => ({ ...prev, [id]: urls }));
            setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
          } else {
            try {
              const t = await fetch(
                `http://localhost:8080/api/images/${id}/post/thumb`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
              );

              if (t.ok) {
                const contentType = t.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                  const respostaThumb = await t.json();
                  if (respostaThumb.data) {
                    setImageMap((prev) => ({
                      ...prev,
                      [id]: [`data:image/jpeg;base64,${respostaThumb.data}`],
                    }));
                  } else {
                    setImageMap((prev) => ({
                      ...prev,
                      [id]: ["/placeholder.jpg"],
                    }));
                  }
                } else {
                  const blob = await t.blob();
                  const u = URL.createObjectURL(blob);
                  createdObjectURLs.push(u);
                  setImageMap((prev) => ({ ...prev, [id]: [u] }));
                }

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
              `http://localhost:8080/api/comments/getComments/post/${post.id}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            if (cRes.ok) {
              const respostaComentarios = await cRes.json();
              const arr = Array.isArray(respostaComentarios?.data)
                ? respostaComentarios.data
                : Array.isArray(respostaComentarios)
                ? respostaComentarios
                : [];

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
            const respostaFavs = await favsRes.json();
            const favs = Array.isArray(respostaFavs?.data)
              ? respostaFavs.data
              : Array.isArray(respostaFavs)
              ? respostaFavs
              : [];

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

  
  // AUTOPLAY DO SLIDER
  
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


  // RENDERIZAÇÃO
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

                  {likeInfo.liked && (
                    <div className="absolute top-2 right-2 text-yellow-400 text-xl drop-shadow">
                      ⭐
                    </div>
                  )}

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

                <div
                  onClick={() => navigate(`/post/${id}`)}
                  className="p-4 cursor-pointer space-y-1"
                >
                  <p className="text-gray-800 font-semibold">
                    {post.description}
                  </p>
                  <p className="text-blue-700 text-lg font-bold">
                    {formatarPreco(post.price)}
                  </p>

                  {(() => {
                    const endereco = formatarEndereco(post.street, post.number, post.avenue);

                    return (
                      <div className="text-gray-600 text-sm">
                        <p>{endereco.linha1}</p>
                        <p>{endereco.linha2}</p>
                      </div>
                    );
                  })()}

                  <PostTags tags={post.tags} />

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

                  {post.updatedAt &&
                    post.createdAt &&
                    new Date(post.updatedAt).getTime() >
                      new Date(post.createdAt).getTime() + 10000000 && (
                      <p className="text-gray-400 text-xs mt-1">
                        Editado em{" "}
                        {format(new Date(post.updatedAt), "dd/MM/yyyy")}
                      </p>
                    )}
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