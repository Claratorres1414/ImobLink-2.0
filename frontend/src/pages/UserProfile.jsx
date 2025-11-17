// src/pages/UserProfile.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

export default function UserProfile() {
  const { id } = useParams(); // id do usuário (rota: /user/:id)
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null); // dados do logado
  const [user, setUser] = useState(null); // dados do perfil aberto
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const [posts, setPosts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [carouselIndex, setCarouselIndex] = useState({});
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [showModal, setShowModal] = useState({ open: false, which: null }); // which: "followers" | "following"
  const [isFollowing, setIsFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const slideIntervals = useRef({});

  const API = "http://localhost:8080";

  // -------------------------
  // buscar foto de perfil (reutilizável)
  // -------------------------
  async function buscarFotoPerfil(imageId) {
    if (!imageId) return "/imagemperfil.jpg";
    const tentativas = [
      `${API}/api/images/get/${imageId}`,
      `${API}/api/images/${imageId}/profile`,
      `${API}/api/images/profile/${imageId}`,
    ];
    for (let url of tentativas) {
      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch {}
    }
    return "/imagemperfil.jpg";
  }

  // -------------------------
  // carregar dados do usuário logado (para comparar)
  // -------------------------
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/user/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const me = await res.json();
        setCurrentUser(me);
      } catch (err) {
        console.error("Erro ao buscar usuário logado:", err);
      }
    })();
  }, [token]);

  // -------------------------
  // carregar dados do usuário visualizado
  // -------------------------
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function carregarUser() {
      try {
        const res = await fetch(`${API}/api/user/getAccount/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        const data = await res.json();
        if (!mounted) return;

        setUser(data);

        // imagem de perfil
        const foto = await buscarFotoPerfil(data.imageProfileId);
        if (mounted) setFotoPerfil(foto);
      } catch (err) {
        console.error(err);
        // se quiser redirecionar quando não existir: navigate("/home");
      }
    }

    carregarUser();
    return () => (mounted = false);
  }, [id, token]);

  // -------------------------
  // carregar followers / followings counts & lists
  // -------------------------
  async function carregarFollowersAndFollowings() {
    try {
      // followers do perfil aberto
      const fRes = await fetch(`${API}/api/follow/getFollowers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const followersArr = fRes && fRes.ok ? await fRes.json() : [];

      // followings do perfil aberto
      const gRes = await fetch(`${API}/api/follow/getFollowings/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const followingsArr = gRes && gRes.ok ? await gRes.json() : [];

      // pré-carregar imagens para cada user na lista
      const followersWithImgs = await Promise.all(
        (followersArr || []).map(async (u) => {
          const img = u.imageProfileId ? await buscarFotoPerfil(u.imageProfileId) : "/imagemperfil.jpg";
          return { ...u, _imageUrl: img };
        })
      );
      const followingsWithImgs = await Promise.all(
        (followingsArr || []).map(async (u) => {
          const img = u.imageProfileId ? await buscarFotoPerfil(u.imageProfileId) : "/imagemperfil.jpg";
          return { ...u, _imageUrl: img };
        })
      );

      setFollowers(followersWithImgs);
      setFollowings(followingsWithImgs);
      setCounts({ followers: followersWithImgs.length, following: followingsWithImgs.length });

      // também determinar se o usuário logado já segue este perfil (usa endpoint do logado)
      if (token) {
        const myFollowingsRes = await fetch(`${API}/api/follow/getFollowings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (myFollowingsRes.ok) {
          const myFollowings = await myFollowingsRes.json();
          // myFollowings pode ser array de users ou objetos; checamos por id/email
          const already = (myFollowings || []).some((u) => {
            const uid = u.id ?? u.userId ?? u.idUser ?? (typeof u === "string" ? u : undefined);
            return String(uid) === String(id) || String(u) === String(id);
          });
          setIsFollowing(already);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar followers/followings:", err);
    }
  }

  useEffect(() => {
    carregarFollowersAndFollowings();
  }, [id, token]);

  // -------------------------
  // buscar posts do usuário (filtrar /api/feed)
  // -------------------------
  useEffect(() => {
    let mounted = true;
    const created = [];

    async function carregarPosts() {
      try {
        const res = await fetch(`${API}/api/feed`);
        if (!res.ok) throw new Error("Erro ao buscar feed");
        const all = await res.json();
        if (!mounted) return;

        // filtrar por userId
        const meus = (all || []).filter((p) => String(p.userId) === String(id));
        setPosts(meus);

        // carregar thumbs (primeira imagem) para os posts
        for (const p of meus) {
          try {
            const t = await fetch(`${API}/api/images/${p.id}/post/thumb`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (t.ok) {
              const blob = await t.blob();
              const url = URL.createObjectURL(blob);
              created.push(url);
              setImageMap((prev) => ({ ...prev, [p.id]: url }));
              setCarouselIndex((prev) => ({ ...prev, [p.id]: 0 }));
            } else {
              setImageMap((prev) => ({ ...prev, [p.id]: "/placeholder.jpg" }));
            }
          } catch {
            setImageMap((prev) => ({ ...prev, [p.id]: "/placeholder.jpg" }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    carregarPosts();

    return () => {
      mounted = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [id, token]);

  // -------------------------
  // autoplay carrossel simples
  // -------------------------
  useEffect(() => {
    Object.values(slideIntervals.current).forEach(clearInterval);
    slideIntervals.current = {};

    Object.entries(imageMap).forEach(([postId, urlsOrUrl]) => {
      // aqui imageMap[p.id] é uma string (uma thumb) — sem autoplay; se no futuro for array, tratar
    });

    return () => {
      Object.values(slideIntervals.current).forEach(clearInterval);
    };
  }, [imageMap]);

  // -------------------------
  // follow / unfollow
  // -------------------------
  async function handleFollow() {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API}/api/follow/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // atualizar estado local e recarregar lista para ter consistência
        await carregarFollowersAndFollowings();
      }
    } catch (err) {
      console.error("Erro ao seguir:", err);
    }
  }

  async function handleUnfollow() {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API}/api/follow/unfollow/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await carregarFollowersAndFollowings();
      }
    } catch (err) {
      console.error("Erro ao deixar de seguir:", err);
    }
  }

  // -------------------------
  // abrir modal ao clicar nos números
  // -------------------------
  async function openModal(which) {
    // re-carregar as listas antes de abrir (garante fresh)
    await carregarFollowersAndFollowings();
    setShowModal({ open: true, which });
  }
  function closeModal() {
    setShowModal({ open: false, which: null });
  }

  // -------------------------
  // helper para navegar no modal (fecha modal antes)
  // -------------------------
  function handleVerUsuario(u) {
    const targetId = u.id ?? u.userId ?? u.idUser;
    closeModal();
    // se for o próprio logado -> Perfil.jsx, senão /user/:id
    if (currentUser && String(currentUser.id) === String(targetId)) {
      navigate("/perfil");
    } else {
      navigate(`/user/${targetId}`);
    }
  }

  // -------------------------
  // render
  // -------------------------
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Perfil principal */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex items-start">
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-36 h-36 rounded-full object-cover border"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{user?.name || "Usuário"}</h2>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <p className="text-gray-600 mt-1">
                  Telefone: {user?.phoneNumber || "Não informado"}
                </p>
                {/* mostrar outras infos que não são id/role */}
                {user?.bio && (
                  <p className="mt-2 text-sm text-gray-700"> {user.bio} </p>
                )}
              </div>

              {/* contadores + botão seguir (botão abaixo dos contadores visualmente) */}
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex items-center gap-4 text-center">
                  <button
                    onClick={() => openModal("followers")}
                    className="flex flex-col items-center"
                  >
                    <span className="font-bold text-lg">{counts.followers}</span>
                    <span className="text-xs text-gray-500">Seguidores</span>
                  </button>

                  <button
                    onClick={() => openModal("following")}
                    className="flex flex-col items-center"
                  >
                    <span className="font-bold text-lg">{counts.following}</span>
                    <span className="text-xs text-gray-500">Seguindo</span>
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{posts.length}</span>
                    <span className="text-xs text-gray-500">Publicações</span>
                  </div>
                </div>

                {/* botão seguir abaixo dos contadores (reserva espaço para evitar pulo) */}
                <div className="mt-2">
                  {currentUser && String(currentUser.id) === String(id) ? (
                    <button
                      onClick={() => navigate("/editar-perfil")}
                      className="px-4 py-2 border rounded bg-white text-gray-700"
                    >
                      Editar Perfil
                    </button>
                  ) : isFollowing ? (
                    <button
                      onClick={handleUnfollow}
                      className="px-4 py-2 rounded border bg-white text-gray-800 hover:bg-gray-50"
                    >
                      Deixar de seguir
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Seguir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publicações do usuário */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Publicações</h3>

          {posts.length === 0 ? (
            <p className="text-gray-600">Este usuário ainda não publicou nada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => {
                const thumb = imageMap[post.id] || "/placeholder.jpg";
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="cursor-pointer bg-white border rounded-xl shadow hover:shadow-md transition overflow-hidden"
                  >
                    {/* Imagem */}
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={thumb}
                        alt={post.description}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />

                      {/* Tipo da postagem */}
                      {post.type && (
                        <div
                          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            post.type.toLowerCase() === "aluguel"
                              ? "bg-green-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {post.type}
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-gray-800 line-clamp-2">
                        {post.description}
                      </p>
                      <p className="text-gray-600 text-sm truncate">
                        R$ {post.price} — {post.street}, {post.avenue}
                      </p>
                      <p className="text-xs text-gray-400">
                        Publicado em{" "}
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("pt-BR")
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal simples de followers / following */}
      {showModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-11/12 md:w-3/5 max-h-[80vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">
                {showModal.which === "followers" ? "Seguidores" : "Seguindo"}
              </h4>
              <button onClick={closeModal} className="text-gray-600">Fechar</button>
            </div>

            <div className="space-y-3">
              {(showModal.which === "followers" ? followers : followings).length === 0 ? (
                <p className="text-gray-600">Nenhum usuário encontrado.</p>
              ) : (
                (showModal.which === "followers" ? followers : followings).map((u) => (
                  <div key={u.id ?? u.userId ?? u.email} className="flex items-center gap-3 p-2 border-b">
                    <img
                      src={u._imageUrl || "/imagemperfil.jpg"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.src = "/imagemperfil.jpg")}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{u.name ?? u.nome ?? u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleVerUsuario(u)}
                        className="text-sm px-3 py-1 rounded border"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
