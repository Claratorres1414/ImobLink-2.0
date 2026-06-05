import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { API_URL, TOKEN_KEY } from "../config/constants";

function Perfil() {
  const [dadosUsuario, setDadosUsuario] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const [favoritos, setFavoritos] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [showModal, setShowModal] = useState({ open: false, which: null });
  const [avatarMap, setAvatarMap] = useState({}); // Map para armazenar Blob URLs dos avatares

  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);

  // Carregar dados do usuário logado
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch("${API_URL}/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const resposta = await res.json();
        const data = resposta.data || resposta;
        setDadosUsuario(data);

        if (data.imageProfileId) {
          fetch(`${API_URL}/images/get/${data.imageProfileId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(async (res) => {
              if (!res.ok) throw new Error();

              const contentType = res.headers.get("content-type");

              if (contentType && contentType.includes("application/json")) {
                const respostaImg = await res.json();
                if (respostaImg.data) {
                  setFotoPerfil(`data:image/jpeg;base64,${respostaImg.data}`);
                }
              } else {
                const blob = await res.blob();
                setFotoPerfil(URL.createObjectURL(blob));
              }
            })
            .catch(() => setFotoPerfil("/imagemperfil.jpg"));
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate, token]);

  // Carregar seguidores e seguindo
  useEffect(() => {
    async function fetchFollowData() {
      try {
        const followersRes = await fetch("${API_URL}/follow/getFollowers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followingsRes = await fetch("${API_URL}/follow/getFollowings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (followersRes.ok) {
          const respostaFollowers = await followersRes.json();
          setFollowers(Array.isArray(respostaFollowers.data) ? respostaFollowers.data : []);
        }

        if (followingsRes.ok) {
          const respostaFollowings = await followingsRes.json();
          setFollowings(Array.isArray(respostaFollowings.data) ? respostaFollowings.data : []);
        }
      } catch (err) {
        console.error("Erro ao carregar seguidores:", err);
      }
    }
    fetchFollowData();
  }, [token]);

  // Carregar favoritos
  useEffect(() => {
    async function carregarFavoritos() {
      try {
        const res = await fetch("${API_URL}/posts/my-favs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar favoritos");

        const resposta = await res.json();
        const data = Array.isArray(resposta.data) ? resposta.data : [];
        setFavoritos(data);

        for (const post of data) {
          try {
            const imgRes = await fetch(
              `${API_URL}/images/${post.id}/post/thumb`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (imgRes.ok) {
              const contentType = imgRes.headers.get("content-type");

              if (contentType && contentType.includes("application/json")) {
                const respostaImg = await imgRes.json();
                if (respostaImg.data) {
                  setImageMap((prev) => ({
                    ...prev,
                    [post.id]: `data:image/jpeg;base64,${respostaImg.data}`,
                  }));
                }
              } else {
                const blob = await imgRes.blob();
                const url = URL.createObjectURL(blob);
                setImageMap((prev) => ({ ...prev, [post.id]: url }));
              }
            } else {
              setImageMap((prev) => ({ ...prev, [post.id]: "/placeholder.jpg" }));
            }
          } catch {
            setImageMap((prev) => ({ ...prev, [post.id]: "/placeholder.jpg" }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }

    carregarFavoritos();
  }, [token]);

  // Pré-carregar avatares dos seguidores/seguindo em Blob URL
  useEffect(() => {
    async function carregarAvatares(users) {
      const newAvatarMap = {};
      for (const u of users) {
        if (u.imageProfileId) {
          try {
            const res = await fetch(`${API_URL}/images/get/${u.imageProfileId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const contentType = imgRes.headers.get("content-type");

              if (contentType && contentType.includes("application/json")) {
                const respostaImg = await imgRes.json();
                if (respostaImg.data) {
                  setImageMap((prev) => ({
                    ...prev,
                    [post.id]: `data:image/jpeg;base64,${respostaImg.data}`,
                  }));
                }
              } else {
                const blob = await imgRes.blob();
                const url = URL.createObjectURL(blob);
                setImageMap((prev) => ({ ...prev, [post.id]: url }));
              }
            } else {
              newAvatarMap[u.id ?? u.userId ?? u.email] = "/imagemperfil.jpg";
            }
          } catch {
            newAvatarMap[u.id ?? u.userId ?? u.email] = "/imagemperfil.jpg";
          }
        } else {
          newAvatarMap[u.id ?? u.userId ?? u.email] = "/imagemperfil.jpg";
        }
      }
      setAvatarMap((prev) => ({ ...prev, ...newAvatarMap }));
    }

    carregarAvatares(followers);
    carregarAvatares(followings);
  }, [followers, followings, token]);

  // Função de navegar para perfil de outro usuário
  function handleVerUsuario(u) {
    navigate(`/user/${u.id ?? u.userId}`);
    setShowModal({ open: false, which: null });
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col items-center bg-slate-100 p-6 mt-8 space-y-8">
        {/* CARD DE PERFIL */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex w-full max-w-4xl">
          {/* FOTO */}
          <div className="w-1/3 flex justify-center items-start">
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-lg border-2 border-gray-300 object-cover"
            />
          </div>

          {/* DADOS */}
          <div className="w-2/3 pl-6 space-y-4">
            {/* Header com email à esquerda e contadores à direita */}
            <div className="flex justify-between items-start w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{dadosUsuario.name}</h2>
                <p className="text-gray-600">
                  Telefone: {dadosUsuario.phoneNumber || "Não informado"}
                </p>
                <p className="text-gray-600">Email: {dadosUsuario.email}</p>
              </div>

              {/* Contadores lado a lado */}
              <div className="flex gap-6 text-center">
                <button
                  className="hover:opacity-80"
                  onClick={() => setShowModal({ open: true, which: "followers" })}
                >
                  <p className="font-bold text-lg">{followers.length}</p>
                  <span className="text-sm text-gray-600">Seguidores</span>
                </button>

                <button
                  className="hover:opacity-80"
                  onClick={() => setShowModal({ open: true, which: "followings" })}
                >
                  <p className="font-bold text-lg">{followings.length}</p>
                  <span className="text-sm text-gray-600">Seguindo</span>
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio:</h3>
              <div className="border border-gray-300 rounded p-3 text-gray-700 bg-gray-50 text-sm">
                {dadosUsuario.bio || "Sem biografia ainda..."}
              </div>
            </div>

            {/* Botão Editar */}
            <button
              onClick={() => navigate("/editar-perfil")}
              className="flex items-center gap-2 text-blue-600 border border-blue-500 px-4 py-1 rounded hover:bg-blue-100 mt-3"
            >
              <Pencil size={16} />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* FAVORITOS */}
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Publicações Favoritadas</h3>

          {favoritos.length === 0 ? (
            <p className="text-gray-600 text-center">
              Você ainda não favoritou nenhuma publicação.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoritos.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="cursor-pointer bg-white border rounded-xl shadow hover:shadow-md transition overflow-hidden"
                >
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={imageMap[post.id] || "/placeholder.jpg"}
                      alt={post.description}
                      className="w-full h-full object-cover hover:scale-105 duration-300"
                    />
                    {post.type && (
                      <span
                        className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full text-white font-semibold ${
                          post.type.toLowerCase() === "aluguel"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {post.type}
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="font-semibold text-gray-800 line-clamp-2">
                      {post.description}
                    </p>
                    <p className="text-gray-600 text-sm truncate">
                      R$ {post.price} — {post.street}, {post.avenue}
                    </p>
                    <p className="text-xs text-gray-400">
                      Publicado em {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOLLOWERS/FOLLOWING */}
        {showModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-11/12 md:w-1/2 max-h-[80vh] overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">
                  {showModal.which === "followers" ? "Seguidores" : "Seguindo"}
                </h4>
                <button
                  className="text-gray-600"
                  onClick={() => setShowModal({ open: false, which: null })}
                >
                  Fechar
                </button>
              </div>

              <div className="space-y-3">
                {(showModal.which === "followers" ? followers : followings).length === 0 ? (
                  <p className="text-gray-600">Nenhum usuário encontrado.</p>
                ) : (
                  (showModal.which === "followers" ? followers : followings).map((u) => (
                    <div
                      key={u.id ?? u.userId ?? u.email}
                      className="flex items-center gap-3 p-2 border-b"
                    >
                      <img
                        src={avatarMap[u.id ?? u.userId ?? u.email] || "/imagemperfil.jpg"}
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
      </div>
    </DashboardLayout>
  );
}

export default Perfil;
