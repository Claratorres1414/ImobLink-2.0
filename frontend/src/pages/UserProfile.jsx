import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Comentarios from "../components/Comentarios";

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

  // --- Novos states para comentários ---
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [showComentarioBox, setShowComentarioBox] = useState(false);

  const API = "http://localhost:8080";

  
  // buscar foto de perfil
  
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

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const resposta = await res.json();
        if (resposta.data) {
          return `data:image/jpeg;base64,${resposta.data}`;
        }
      } else {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch {}
  }

  return "/imagemperfil.jpg";
}

  // carregar dados do usuário logado
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/user/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const resposta = await res.json();
        const me = resposta.data || resposta;
        setCurrentUser(me);
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
        const resposta = await res.json();
        const data = resposta.data || resposta;
        if (!mounted) return;
        setUser(data);

        // imagem de perfil
        const foto = await buscarFotoPerfil(data.imageProfileId);
        if (mounted) setFotoPerfil(foto);
      } catch (err) {
        console.error(err);
      }
    }

    carregarUser();
    return () => (mounted = false);
  }, [id, token]);

  // carregar seguidores e seguidos

  async function carregarFollowersAndFollowings() {
    try {
      const fRes = await fetch(`${API}/api/follow/getFollowers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const respostaFollowers = fRes && fRes.ok ? await fRes.json() : { data: [] };
      const followersArr = Array.isArray(respostaFollowers.data) ? respostaFollowers.data : [];
      const gRes = await fetch(`${API}/api/follow/getFollowings/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const respostaFollowings = gRes && gRes.ok ? await gRes.json() : { data: [] };
      const followingsArr = Array.isArray(respostaFollowings.data) ? respostaFollowings.data : [];
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

      if (token) {
        const myFollowingsRes = await fetch(`${API}/api/follow/getFollowings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (myFollowingsRes.ok) {
        const respostaMyFollowings = await myFollowingsRes.json();
        const myFollowings = Array.isArray(respostaMyFollowings.data) ? respostaMyFollowings.data : [];
        const already = myFollowings.some((u) => String(u.id ?? u.userId ?? u.idUser ?? u) === String(id));
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


  // buscar posts do usuário

  useEffect(() => {
    let mounted = true;
    const created = [];

    async function carregarPosts() {
      try {
        const res = await fetch(`${API}/api/feed`);
        if (!res.ok) throw new Error("Erro ao buscar feed");
        const resposta = await res.json();
        const all = Array.isArray(resposta.data) ? resposta.data : [];
        if (!mounted) return;

        const meus = all.filter((p) => String(p.userId) === String(id));
        setPosts(meus);

        for (const p of meus) {
          try {
            const t = await fetch(`${API}/api/images/${p.id}/post/thumb`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
          if (t.ok) {
            const contentType = t.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const respostaThumb = await t.json();
              const url = respostaThumb.data
                ? `data:image/jpeg;base64,${respostaThumb.data}`
                : "/placeholder.jpg";
              setImageMap((prev) => ({ ...prev, [p.id]: url }));
              setCarouselIndex((prev) => ({ ...prev, [p.id]: 0 }));
            } else {
              const blob = await t.blob();
              const url = URL.createObjectURL(blob);
              created.push(url);
              setImageMap((prev) => ({ ...prev, [p.id]: url }));
              setCarouselIndex((prev) => ({ ...prev, [p.id]: 0 }));
            }
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


  // Funções de follow/unfollow

  async function handleFollow() {
    if (!token) return navigate("/login");
    try {
      const res = await fetch(`${API}/api/follow/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await carregarFollowersAndFollowings();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUnfollow() {
    if (!token) return navigate("/login");
    try {
      const res = await fetch(`${API}/api/follow/unfollow/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await carregarFollowersAndFollowings();
    } catch (err) {
      console.error(err);
    }
  }


  // Funções para comentários

async function carregarComentarios(userId) {
  try {
    const res = await fetch(`${API}/api/comments/getComments/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const resposta = await res.json();
    const lista = Array.isArray(resposta.data) ? resposta.data : [];

    const comentariosPerfil = lista.filter((c) => !c.postId);

    const completos = await Promise.all(
      comentariosPerfil.map(async (c) => {
        let autor = { name: "Usuário" };

        try {
          const r = await fetch(`${API}/api/user/getAccount/${c.authorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (r.ok) {
            const respostaAutor = await r.json();
            autor = respostaAutor.data || respostaAutor;
          }
        } catch {}

        return {
          ...c,
          autorNome: autor.name,
          autorImagem: await buscarFotoPerfil(autor.imageProfileId),
        };
      })
    );

    setComentarios(completos);
  } catch (err) {
    console.error("Erro ao carregar comentários:", err);
  }
}

  async function enviarComentario(userId) {
    if (!novoComentario.trim()) return;
    const res = await fetch(`${API}/api/comments/comment/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: novoComentario }),
    });
    if (res.ok) {
      setNovoComentario("");
      setShowComentarioBox(false);
      carregarComentarios(userId);
    } else {
      console.error("Falha ao enviar comentário", res.status);
    }
  }

  useEffect(() => {
    if (!id) return;
    carregarComentarios(id);
  }, [id]);


  // Função adicionada: openModal (apenas esta função foi inserida)

  function openModal(which) {
    setShowModal({ open: true, which });
  }



  // render

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
                {user?.bio && <p className="mt-2 text-sm text-gray-700"> {user.bio} </p>}
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex items-center gap-4 text-center">
                  <button onClick={() => openModal("followers")} className="flex flex-col items-center">
                    <span className="font-bold text-lg">{counts.followers}</span>
                    <span className="text-xs text-gray-500">Seguidores</span>
                  </button>
                  <button onClick={() => openModal("following")} className="flex flex-col items-center">
                    <span className="font-bold text-lg">{counts.following}</span>
                    <span className="text-xs text-gray-500">Seguindo</span>
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{posts.length}</span>
                    <span className="text-xs text-gray-500">Publicações</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-2">
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
                  {currentUser && String(currentUser.id) !== String(id) && (
                    <button
                      onClick={() => {
                        // SALVAR NO LOCALSTORAGE
                        const contatos = JSON.parse(localStorage.getItem("contatos") || "[]");
                        const jaExiste = contatos.some(c => c.id === id);
                        if (!jaExiste) {
                          contatos.push({ id, name: user?.name || "Usuário" });
                          localStorage.setItem("contatos", JSON.stringify(contatos));
                        }

                        // Navegar para o chat
                        navigate(`/chat/${id}`);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Enviar mensagem
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
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={thumb}
                        alt={post.description}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {post.type && (
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          post.type.toLowerCase() === "aluguel"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}>
                          {post.type}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-gray-800 line-clamp-2">{post.description}</p>
                      <p className="text-gray-600 text-sm truncate">
                        R$ {post.price} — {post.street}, {post.avenue}
                      </p>
                      <p className="text-xs text-gray-400">
                        Publicado em {post.createdAt ? new Date(post.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sessão de comentários sobre este usuário */}
        <div className="bg-white rounded-lg shadow p-6 mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Comentários ({comentarios.length})</h3>
            <button
              onClick={() => setShowComentarioBox(v => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow"
            >
              {showComentarioBox ? "Cancelar" : "+ Adicionar comentário"}
            </button>
          </div>

          {showComentarioBox && (
            <div className="bg-white p-4 border rounded-xl shadow">
              <textarea
                className="w-full border p-3 rounded-xl"
                rows={3}
                placeholder="Escreva seu comentário..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
              ></textarea>

              <button
                onClick={() => enviarComentario(id)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow"
              >
                Enviar
              </button>
            </div>
          )}

          <Comentarios
            comentarios={comentarios}
            token={token}
            userId={currentUser?.id}
            onDelete={(cid) => setComentarios(prev => prev.filter(c => c.id !== cid))}
          />
        </div>
      </div>

      {/* Modal simples de followers / following */}
      {showModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-11/12 md:w-3/5 max-h-[80vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">{showModal.which === "followers" ? "Seguidores" : "Seguindo"}</h4>
              <button onClick={() => setShowModal({ open: false, which: null })} className="text-gray-600">Fechar</button>
            </div>

            <div className="space-y-3">
              {(showModal.which === "followers" ? followers : followings).length === 0 ? (
                <p className="text-gray-600">Nenhum usuário encontrado.</p>
              ) : (
                (showModal.which === "followers" ? followers : followings).map((u) => (
                  <div key={u.id ?? u.userId ?? u.email} className="flex items-center gap-3 p-2 border-b">
                    <img src={u._imageUrl || "/imagemperfil.jpg"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold">{u.name ?? u.nome ?? u.email}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          const targetId = u.id ?? u.userId ?? u.idUser;
                          setShowModal({ open: false, which: null });
                          if (currentUser && String(currentUser.id) === String(targetId)) navigate("/perfil");
                          else navigate(`/user/${targetId}`);
                        }}
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
