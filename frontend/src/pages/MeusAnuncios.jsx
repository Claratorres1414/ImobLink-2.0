import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";


function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState({});
  const slideIntervals = useRef({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [likedMap, setLikedMap] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const [comentariosModal, setComentariosModal] = useState({
    
    aberto: false,
    postId: null,
    comentarios: [],
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

async function fetchAllImagesForPost(postId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/images/${postId}/post/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const resposta = await res.json();
      const images = Array.isArray(resposta.data) ? resposta.data : [];
      const urls = [];

      for (const img of images) {
        try {
          const fetchImg = await fetch(
            `http://localhost:8080/api/images/get/${img.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!fetchImg.ok) continue;

          const contentType = fetchImg.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const respostaImg = await fetchImg.json();

            if (respostaImg.data) {
              urls.push(`data:image/jpeg;base64,${respostaImg.data}`);
            }
          } else {
            const blob = await fetchImg.blob();
            urls.push(URL.createObjectURL(blob));
          }
        } catch {}
      }

      if (urls.length) return urls;
    }
  } catch {}

  // fallback para thumb
  try {
    const thumbRes = await fetch(
      `http://localhost:8080/api/images/${postId}/post/thumb`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (thumbRes.ok) {
      const contentType = thumbRes.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const resposta = await thumbRes.json();
        if (resposta.data) {
          return [`data:image/jpeg;base64,${resposta.data}`];
        }
      } else {
        const blob = await thumbRes.blob();
        return [URL.createObjectURL(blob)];
      }
    }
  } catch {}

  return null;
}

  async function fetchUserAvatar(userId) {
    if (!userId) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    try {
      const res = await fetch(`http://localhost:8080/api/images/get/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      }
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
  }


  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const res = await fetch("http://localhost:8080/api/posts/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Erro ao carregar posts");

        const resposta = await res.json();
        const data = Array.isArray(resposta.data) ? resposta.data : [];
        setPosts(data);

        for (const post of data) {
          const urls = (await fetchAllImagesForPost(post.id)) || [];
          setImageMap((prev) => ({
            ...prev,
            [post.id]: urls.length ? urls : ["/placeholder.jpg"],
          }));
          setCurrentIndex((prev) => ({ ...prev, [post.id]: 0 }));

          setLikedMap((prev) => ({
            ...prev,
            [post.id]: { count: post.likedTimes ?? 0, liked: false },
          }));

          try {
            const cRes = await fetch(
              `http://localhost:8080/api/comments/getComments/post/${post.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (cRes.ok) {
              const respostaComentarios = await cRes.json();
              const arr = Array.isArray(respostaComentarios.data) ? respostaComentarios.data : [];
              setCommentsCount((prev) => ({ ...prev, [post.id]: arr.length }));
            } else {
              setCommentsCount((prev) => ({ ...prev, [post.id]: 0 }));
            }
          } catch {
            setCommentsCount((prev) => ({ ...prev, [post.id]: 0 }));
          }
        }
      } catch {
        setErro("Erro ao carregar seus anúncios.");
      }

      setCarregando(false);
    }

    carregar();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    Object.values(slideIntervals.current).forEach(clearInterval);
    slideIntervals.current = {};

    Object.entries(imageMap).forEach(([postId, imgs]) => {
      if (imgs.length <= 1) return;
      slideIntervals.current[postId] = setInterval(() => {
        setCurrentIndex((prev) => ({
          ...prev,
          [postId]: (prev[postId] + 1) % imgs.length,
        }));
      }, 3500);
    });

    return () => {
      Object.values(slideIntervals.current).forEach(clearInterval);
    };
  }, [imageMap]);

  const next = (postId) => {
    const imgs = imageMap[postId];
    if (!imgs) return;
    setCurrentIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] + 1) % imgs.length,
    }));
  };

  const prev = (postId) => {
    const imgs = imageMap[postId];
    if (!imgs) return;
    setCurrentIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] - 1 + imgs.length) % imgs.length,
    }));
  };

  async function handleExcluir(id) {
    if (!window.confirm("Excluir este anúncio?")) return;
    const res = await fetch(`http://localhost:8080/api/posts/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("Post excluído!");
      setPosts((p) => p.filter((x) => x.id !== id));
    }
  }



async function abrirComentarios(postId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/comments/getComments/post/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error("Erro ao carregar comentários");

    const respostaComentarios = await res.json();
    const arr = Array.isArray(respostaComentarios.data) ? respostaComentarios.data : [];

    const comentariosComAvatar = [];

    for (const c of arr) {
      let avatarFinal = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

      try {
        // BUSCA O USUÁRIO PRIMEIRO
        const resUser = await fetch(
          `http://localhost:8080/api/user/getAccount/${c.authorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resUser.ok) {
          const respostaUser = await resUser.json();
          const userJson = respostaUser.data || respostaUser;
          const imgProfileId = userJson.imageProfileId;

          if (imgProfileId) {
            const resImg = await fetch(
              `http://localhost:8080/api/images/get/${imgProfileId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (resImg.ok) {
              const contentType = resImg.headers.get("content-type");

              if (contentType && contentType.includes("application/json")) {
                const respostaImg = await resImg.json();
                if (respostaImg.data) {
                  avatarFinal = `data:image/jpeg;base64,${respostaImg.data}`;
                }
              } else {
                const blob = await resImg.blob();
                avatarFinal = URL.createObjectURL(blob);
              }
            }
          }
        }
      } catch {}

      comentariosComAvatar.push({
        ...c,
        avatar: avatarFinal,
        userName: c.authorName,
        userId: c.authorId,
      });
    }

    setComentariosModal({
      aberto: true,
      postId,
      comentarios: comentariosComAvatar,
    });
  } catch {
    alert("Erro ao carregar comentários.");
  }
}
  if (carregando) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600">Carregando...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        
        {/* ---- HEADER ---- */}
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Anúncios</h2>
          <button
            onClick={() => navigate("/publicar")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Nova Publicação
          </button>
        </div>

        {/* ---- LISTAGEM ---- */}
        {posts.length === 0 ? (
          <p>Você ainda não publicou nada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const imgs = imageMap[post.id] || ["/placeholder.jpg"];
              const idx = currentIndex[post.id] ?? 0;
              const likeInfo = likedMap[post.id] || { count: 0, liked: false };
              const commentQty = commentsCount[post.id] ?? 0;

              return (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden relative">
                  
                  {/* IMAGENS */}
                  <div className="relative w-full h-48 overflow-hidden">
                    {imgs.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                          i === idx ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ))}
                  </div>

                  {/* ---- DADOS ---- */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{post.description}</h3>

                    <p className="text-gray-600">
                      R$ {post.price} – {post.street}, {post.number}
                    </p>

                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>👍 {likeInfo.count}</span>
                      <span>💬 {commentQty}</span>
                    </div>

                    <div className="mt-3 flex gap-3 flex-wrap">
                      <button
                        onClick={() => navigate(`/editar-postagem/${post.id}`)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleExcluir(post.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Excluir
                      </button>

                      <button
                        onClick={() => abrirComentarios(post.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Ver Comentários
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---- MODAL ---- */}
        {comentariosModal.aberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg max-h-[80vh] overflow-y-auto relative">

              <button
                onClick={() => setComentariosModal({ aberto: false, postId: null, comentarios: [] })}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                &times;
              </button>

              <h3 className="font-bold text-xl mb-4">Comentários do Post</h3>

              {comentariosModal.comentarios.length === 0 ? (
                <p>Nenhum comentário ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {comentariosModal.comentarios.map((c) => (
                    <li key={c.id} className="border-b pb-2 flex gap-3 items-start">
                      <img
                        src={c.avatar}
                        alt={c.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-600 cursor-pointer"
                        onClick={() => navigate(`/user/${c.userId}`)}
                      />
                      <div>
                        <p
                          className="font-semibold cursor-pointer hover:underline text-blue-700"
                          onClick={() => navigate(`/user/${c.userId}`)}
                        >
                          {c.userName}
                        </p>

                        <p className="text-gray-700 text-sm">{c.content}</p>

                        <p className="text-gray-400 text-xs">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MeusAnuncios;
