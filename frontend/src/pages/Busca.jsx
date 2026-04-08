import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";

// Componente para o card de usuário
function UserCard({ u, token }) {
  const navigate = useNavigate();
  const [userImg, setUserImg] = useState("/imagemperfil.jpg");

  useEffect(() => {
    let mounted = true;
    if (!u.imageProfileId) return;

    const tentativas = [
      `http://localhost:8080/api/images/get/${u.imageProfileId}`,
      `http://localhost:8080/api/images/${u.imageProfileId}/profile`,
      `http://localhost:8080/api/images/profile/${u.imageProfileId}`,
    ];

async function fetchImage() {
  for (const url of tentativas) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const resposta = await res.json();
        if (resposta.data) {
          if (mounted) setUserImg(`data:image/jpeg;base64,${resposta.data}`);
          return;
        }
      } else {
        const blob = await res.blob();
        if (mounted) setUserImg(URL.createObjectURL(blob));
        return;
      }
    } catch {}
  }
}

    fetchImage();
    return () => {
      mounted = false;
    };
  }, [u.imageProfileId, token]);

  return (
    <div
      onClick={() => navigate(`/user/${u.id}`)}
      className="cursor-pointer bg-white shadow rounded p-4 flex items-center gap-4 hover:shadow-lg transition"
    >
      <img
        src={userImg}
        alt={u.name}
        className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
      />
      <div>
        <p className="text-gray-800 font-semibold">{u.name}</p>
        <p className="text-gray-500 text-sm">{u.email}</p>
      </div>
    </div>
  );
}

function Busca() {
  const [usuarios, setUsuarios] = useState([]);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [carouselIndex, setCarouselIndex] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos' | 'usuarios' | 'posts'
  const [filtroVenda, setFiltroVenda] = useState("todos"); // 'todos' | 'aluguel' | 'venda'
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const slideIntervals = useRef({});
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";

  
  // Buscar usuário logado
  
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resposta) => setUser(resposta.data || resposta))
      .catch((err) => console.error("Erro ao buscar usuário:", err));
  }, [token]);

  
  // Buscar usuários
  
  useEffect(() => {
    if (!token || !query) return;

    async function fetchUsuarios() {
      try {
        const res = await fetch("http://localhost:8080/api/user/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const resposta = await res.json();
        const data = Array.isArray(resposta.data) ? resposta.data : [];

        setUsuarios(
          data.filter((u) =>
            u.name.toLowerCase().includes(query.toLowerCase())
          )
        );
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    }

    fetchUsuarios();
  }, [query, token]);

  
  // Buscar posts
  
  useEffect(() => {
    if (!query) return;
    let mounted = true;
    const createdObjectURLs = [];

    async function fetchPosts() {
      try {
        const resPosts = await fetch("http://localhost:8080/api/feed", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resPosts.ok) throw new Error("Erro ao buscar posts");
        const respostaPosts = await resPosts.json();
        const dataPosts = Array.isArray(respostaPosts.data) ? respostaPosts.data : [];

        if (!mounted) return;

        const filtrados = dataPosts.filter((p) =>
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        setPosts(filtrados);

        for (const post of filtrados) {
          const id = post.id;

          // Carregar imagens do post
          try {
            const resImages = await fetch(
              `http://localhost:8080/api/images/${id}/post/all`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

          if (resImages.ok) {
            const respostaImages = await resImages.json();
            const images = Array.isArray(respostaImages.data) ? respostaImages.data : [];
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

            if (urls.length > 0) {
              setImageMap((prev) => ({
                ...prev,
                [id]: urls,
              }));
              setCarouselIndex((prev) => ({ ...prev, [id]: 0 }));
            } else {
              try {
                const thumbRes = await fetch(
                  `http://localhost:8080/api/images/${id}/post/thumb`,
                  { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );

                if (thumbRes.ok) {
                  const contentType = thumbRes.headers.get("content-type");

                  if (contentType && contentType.includes("application/json")) {
                    const respostaThumb = await thumbRes.json();
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
                    const blob = await thumbRes.blob();
                    setImageMap((prev) => ({
                      ...prev,
                      [id]: [URL.createObjectURL(blob)],
                    }));
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
          }


            
            
          } catch {}

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
              const arr = Array.isArray(respostaComentarios.data) ? respostaComentarios.data : [];
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
          const favsRes = await fetch("http://localhost:8080/api/posts/my-favs", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (favsRes.ok) {
            const respostaFavs = await favsRes.json();
            const favs = Array.isArray(respostaFavs.data) ? respostaFavs.data : [];

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
        console.error("Erro ao buscar posts:", err);
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
      Object.values(slideIntervals.current).forEach(clearInterval);
      createdObjectURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [query, token]);

  
  // Slider autoplay
  
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

    return () => Object.values(slideIntervals.current).forEach(clearInterval);
  }, [imageMap]);

  
  // Filtro de posts por tipo e preço
  
  const postsFiltrados = posts
    .filter((p) => filtroVenda === "todos" || p.type.toLowerCase() === filtroVenda)
    .filter((p) => (precoMin ? p.price >= parseFloat(precoMin) : true))
    .filter((p) => (precoMax ? p.price <= parseFloat(precoMax) : true));

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Resultados da busca para "{query}"</h2>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="mr-2 font-semibold">Tipo:</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="todos">Todos</option>
            <option value="usuarios">Usuários</option>
            <option value="posts">Posts</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Venda/Aluguel:</label>
          <select
            value={filtroVenda}
            onChange={(e) => setFiltroVenda(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="todos">Todos</option>
            <option value="aluguel">Aluguel</option>
            <option value="venda">Venda</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Preço mínimo:</label>
          <input
            type="number"
            value={precoMin}
            onChange={(e) => setPrecoMin(e.target.value)}
            className="border p-1 rounded w-20"
          />
        </div>

        <div>
          <label className="mr-2 font-semibold">Preço máximo:</label>
          <input
            type="number"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            className="border p-1 rounded w-20"
          />
        </div>
      </div>

      {/* Usuários */}
      {filtroTipo !== "posts" && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Usuários encontrados</h3>
          {usuarios.length === 0 ? (
            <p className="text-gray-600">Nenhum usuário encontrado.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuarios.map((u) => (
                <UserCard key={u.id} u={u} token={token} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts */}
      {filtroTipo !== "usuarios" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Posts encontrados</h3>
          {postsFiltrados.length === 0 ? (
            <p className="text-gray-600">Nenhum post encontrado.</p>
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
                    </div>

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
                        new Date(post.updatedAt).getTime() >
                          new Date(post.createdAt).getTime() + 10000000 && (
                          <p className="text-gray-400 text-xs mt-1">
                            Editado em {format(new Date(post.updatedAt), "dd/MM/yyyy")}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Busca;
