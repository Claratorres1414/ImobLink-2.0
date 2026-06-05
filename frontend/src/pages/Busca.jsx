import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { formatarPreco, formatarEndereco } from "../utils/formatters";
import PostTags from "../components/PostTags";
import { formatarPrecoInput } from "../utils/formatters";
import { API_URL, TOKEN_KEY } from "../config/constants";

// Componente para o card de usuário
function UserCard({ u, token }) {
  const navigate = useNavigate();
  const [userImg, setUserImg] = useState("/imagemperfil.jpg");

  useEffect(() => {
    let mounted = true;
    if (!u.imageProfileId) return;

    const tentativas = [
      `${API_URL}/images/get/${u.imageProfileId}`,
      `${API_URL}/images/${u.imageProfileId}/profile`,
      `${API_URL}/images/profile/${u.imageProfileId}`,
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
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [buscaTag, setBuscaTag] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");

  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const slideIntervals = useRef({});
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";
  const tagUrl = new URLSearchParams(location.search).get("tag") || "";

  
  // Buscar usuário logado
  
  useEffect(() => {
    if (!token) return;
    fetch("${API_URL}/user/account", {
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
        const res = await fetch("${API_URL}/user/getAll", {
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

  //Buscar Tags
  useEffect(() => {
  async function carregarTags() {
    try {
      const res = await fetch("${API_URL}/tags/suggestions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return;

      const resposta = await res.json();
      const data = Array.isArray(resposta.data) ? resposta.data : [];
      setTagsDisponiveis(data);
    } catch (err) {
      console.error("Erro ao carregar tags:", err);
    }
  }

  

  carregarTags();
}, [token]);
  
  // Buscar posts
  
  useEffect(() => {
    if (!query) return;
    let mounted = true;
    const createdObjectURLs = [];

    async function fetchPosts() {
      try {
        const resPosts = await fetch("${API_URL}/feed", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resPosts.ok) throw new Error("Erro ao buscar posts");
        const respostaPosts = await resPosts.json();
        const dataPosts = Array.isArray(respostaPosts.data) ? respostaPosts.data : [];

        if (!mounted) return;

        const filtrados = dataPosts.filter((p) => {
          const termo = query.toLowerCase();
          const descricaoCombina = p.description?.toLowerCase().includes(termo);
          const tagsCombinam = Array.isArray(p.tags)
            ? p.tags.some((tag) =>
                String(tag.name || tag)
                  .toLowerCase()
                  .includes(termo)
              )
            : false;

          return descricaoCombina || tagsCombinam;
        });
        setPosts(filtrados);

        for (const post of filtrados) {
          const id = post.id;

          // Carregar imagens do post
          try {
            const resImages = await fetch(
              `${API_URL}/images/${id}/post/all`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

          if (resImages.ok) {
            const respostaImages = await resImages.json();
            const images = Array.isArray(respostaImages.data) ? respostaImages.data : [];
            const urls = [];

            for (const img of images) {
              try {
                const b = await fetch(
                  `${API_URL}/images/get/${img.id}`,
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
                  `${API_URL}/images/${id}/post/thumb`,
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
              `${API_URL}/comments/getComments/post/${post.id}`,
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
          const favsRes = await fetch("${API_URL}/posts/my-favs", {
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

    .filter((p) =>
      precoMin
        ? p.price >= Number(String(precoMin).replace(/\D/g, "")) / 100
        : true
    )

    .filter((p) =>
      precoMax
        ? p.price <= Number(String(precoMax).replace(/\D/g, "")) / 100
        : true
    )

    .filter((p) => {
      if (tagsSelecionadas.length === 0) return true;

      if (!Array.isArray(p.tags)) return false;

      const tagsDoPost = p.tags.map((tag) =>
        String(tag.name || tag).toLowerCase()
      );

      return tagsSelecionadas.every((tagSelecionada) =>
        tagsDoPost.includes(tagSelecionada.toLowerCase())
      );
    })

    .sort((a, b) => {
      switch (ordenacao) {
        case "antigas":
          return new Date(a.createdAt) - new Date(b.createdAt);

        case "maiorPreco":
          return Number(b.price || 0) - Number(a.price || 0);

        case "menorPreco":
          return Number(a.price || 0) - Number(b.price || 0);

        case "maisLikes":
          return Number(b.likedTimes || 0) - Number(a.likedTimes || 0);

        case "maisFavoritos":
          return Number(b.favedTimes || 0) - Number(a.favedTimes || 0);

        case "recentes":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  
  function adicionarTagBusca(nomeTag) {
  if (!nomeTag) return;

  const jaExiste = tagsSelecionadas.some(
    (tag) => tag.toLowerCase() === nomeTag.toLowerCase()
  );

  if (jaExiste) return;

  setTagsSelecionadas([...tagsSelecionadas, nomeTag]);
}

function removerTagBusca(nomeTag) {
  setTagsSelecionadas(
    tagsSelecionadas.filter(
      (tag) => tag.toLowerCase() !== nomeTag.toLowerCase()
    )
  );
}

const tagsFiltradas = tagsDisponiveis
  .filter((tag) =>
    tag.name.toLowerCase().includes(buscaTag.toLowerCase())
  )
  .slice(0, 10);

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Resultados da busca para "{query}"</h2>

      {/* Filtros */}
<div className="mb-8 bg-white border rounded-xl p-4 shadow-sm">
  <div className="flex flex-wrap gap-4 items-end mb-4">
    <div>
      <label className="block text-sm font-semibold mb-1">Tipo:</label>
      <select
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
        className="border p-2 rounded-lg min-w-[120px]"
      >
        <option value="todos">Todos</option>
        <option value="usuarios">Usuários</option>
        <option value="posts">Posts</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">Venda/Aluguel:</label>
      <select
        value={filtroVenda}
        onChange={(e) => setFiltroVenda(e.target.value)}
        className="border p-2 rounded-lg min-w-[130px]"
      >
        <option value="todos">Todos</option>
        <option value="aluguel">Aluguel</option>
        <option value="venda">Venda</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">Preço mínimo:</label>
      <input
        type="text"
        value={precoMin}
        onChange={(e) => setPrecoMin(formatarPrecoInput(e.target.value))}
        className="border p-2 rounded-lg w-36"
        placeholder="R$ 0,00"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">Preço máximo:</label>
      <input
        type="text"
        value={precoMax}
        onChange={(e) => setPrecoMax(formatarPrecoInput(e.target.value))}
        className="border p-2 rounded-lg w-36"
        placeholder="R$ 0,00"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold mb-1">Ordenar por:</label>
      <select
        value={ordenacao}
        onChange={(e) => setOrdenacao(e.target.value)}
        className="border p-2 rounded-lg min-w-[160px]"
      >
        <option value="recentes">Mais recentes</option>
        <option value="antigas">Mais antigas</option>
        <option value="maiorPreco">Maior preço</option>
        <option value="menorPreco">Menor preço</option>
        <option value="maisLikes">Mais likes</option>
        <option value="maisFavoritos">Mais favoritos</option>
      </select>
    </div>
  </div>

  <div className="border-t pt-4">
    <label className="block text-sm font-semibold mb-2">
      Filtrar por tags:
    </label>

    <input
      type="text"
      value={buscaTag}
      onChange={(e) => setBuscaTag(e.target.value)}
      placeholder="Pesquisar tag..."
      className="border p-2 rounded-lg w-full max-w-md mb-3"
    />

    <p className="text-xs text-gray-500 mb-2">
      Sugestões mais populares
    </p>

    <div className="flex flex-wrap gap-2 mb-2">
      {tagsFiltradas.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => adicionarTagBusca(tag.name)}
          className="px-3 py-1 bg-gray-100 text-gray-700 border rounded-full text-sm hover:bg-blue-50 hover:text-blue-700"
        >
          #{tag.name}
        </button>
      ))}
    </div>

    {tagsSelecionadas.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {tagsSelecionadas.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removerTagBusca(tag)}
            className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-red-600 transition"
          >
            #{tag} ×
          </button>
        ))}
      </div>
    )}
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

                      <PostTags
                        tags={post.tags}
                        onTagClick={(tag) => navigate(`/busca?query=${encodeURIComponent(tag)}`)}
                      />

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
