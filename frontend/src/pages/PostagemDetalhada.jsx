import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Comentarios from "../components/Comentarios";

function PostagemDetalhada() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [indice, setIndice] = useState(0);
  const [favoritado, setFavoritado] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [showComentarioBox, setShowComentarioBox] = useState(false);

  const [autorPost, setAutorPost] = useState(null);

  const intervalRef = useRef(null);




async function buscarFotoPerfil(imageId) {
  if (!imageId) return "/imagemperfil.jpg";

  try {
    const res = await fetch(
      `http://localhost:8080/api/images/get/${imageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return "/imagemperfil.jpg";

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

  return "/imagemperfil.jpg";
}




async function carregarAutor(userId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/user/getAccount/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const resposta = await res.json();
    const dados = resposta.data || resposta;
    const foto = await buscarFotoPerfil(dados.imageProfileId);

    setAutorPost({
      id: userId,
      nome: dados.name,
      email: dados.email,
      telefone: dados.phoneNumber,
      imagem: foto,
    });
  } catch (err) {
    console.error("Erro ao carregar dados do autor:", err);
  }
}





async function carregarImagens(postId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/images/${postId}/post/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const resposta = await res.json();
      const lista = Array.isArray(resposta?.data)
        ? resposta.data
        : Array.isArray(resposta)
        ? resposta
        : [];

      const urls = [];

      for (const img of lista) {
        try {
          const f = await fetch(
            `http://localhost:8080/api/images/get/${img.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!f.ok) continue;

          const contentType = f.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            const respostaImg = await f.json();
            if (respostaImg.data) {
              urls.push(`data:image/jpeg;base64,${respostaImg.data}`);
            }
          } else {
            const blob = await f.blob();
            urls.push(URL.createObjectURL(blob));
          }
        } catch {}
      }

      if (urls.length > 0) {
        setImagens(urls);
        return;
      }
    }
  } catch {}

  // fallback thumb
  try {
    const res = await fetch(
      `http://localhost:8080/api/images/${postId}/post/thumb`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const respostaThumb = await res.json();
        if (respostaThumb.data) {
          setImagens([`data:image/jpeg;base64,${respostaThumb.data}`]);
        } else {
          setImagens(["/placeholder.jpg"]);
        }
      } else {
        const blob = await res.blob();
        setImagens([URL.createObjectURL(blob)]);
      }

      return;
    }
  } catch {}

  setImagens(["/placeholder.jpg"]);
}

async function carregarComentarios(postId) {
  try {
    const res = await fetch(
      `http://localhost:8080/api/comments/getComments/post/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const resposta = await res.json();

    const lista = Array.isArray(resposta?.data)
      ? resposta.data
      : Array.isArray(resposta)
      ? resposta
      : [];

    const completos = await Promise.all(
      lista.map(async (c) => {
        let autor = { name: "Usuário" };

        try {
          const r = await fetch(
            `http://localhost:8080/api/user/getAccount/${c.authorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

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

  async function toggleFavorito() {
    const endpoint = favoritado
      ? `http://localhost:8080/api/posts/unfav/${post.id}`
      : `http://localhost:8080/api/posts/fav/${post.id}`;
    const method = favoritado ? "DELETE" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) setFavoritado((prev) => !prev);
    } catch {
      console.error("Erro ao favoritar/desfavoritar");
    }
  }

  async function toggleLike() {
    const endpoint = liked
      ? `http://localhost:8080/api/posts/unlike/${post.id}`
      : `http://localhost:8080/api/posts/like/${post.id}`;

    const method = liked ? "DELETE" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setLiked(!liked);
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error("Erro ao dar like/deslike:", err);
    }
  }

  useEffect(() => {




async function carregar() {
  try {
    const res = await fetch(
      `http://localhost:8080/api/posts/getOne/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error("Postagem não encontrada");

    const data = await res.json();
    const postData = data.data || data;

    setPost(postData);
    setLiked(Boolean(postData.wasLiked));
    setLikesCount(Number(postData.likedTimes) || 0);

    if (postData.userId) {
      carregarAutor(postData.userId);
    }

    if (postData.id) {
      carregarImagens(postData.id);
      carregarComentarios(postData.id);
    }

    const favRes = await fetch(
      "http://localhost:8080/api/posts/my-favs",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (favRes.ok) {
      const respostaFavs = await favRes.json();
      const favs = Array.isArray(respostaFavs?.data) ? respostaFavs.data : [];
      const isFav = favs.some((f) => f.id === postData.id);
      setFavoritado(isFav);
    }
  } catch (err) {
    console.error(err);
  }
}


    carregar();
  }, [id]);

  useEffect(() => {
    if (imagens.length <= 1) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndice((i) => (i + 1) % imagens.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [imagens]);

  function next() {
    setIndice((i) => (i + 1) % imagens.length);
  }

  function prev() {
    setIndice((i) => (i - 1 + imagens.length) % imagens.length);
  }

  if (!post) {
    return (
      <DashboardLayout>
        <p className="text-center mt-6">Carregando postagem...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        {/* SLIDER */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow-lg bg-black">
          {imagens.map((src, i) => (
            <img
              key={i}
              src={src}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                i === indice ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {post.type && (
            <div
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                post.type.toLowerCase() === "aluguel"
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {post.type}
            </div>
          )}

          {imagens.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
              >
                ❮
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-1 rounded-full"
              >
                ❯
              </button>

              <div className="absolute bottom-3 w-full flex justify-center gap-2">
                {imagens.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === indice ? "bg-white" : "bg-white/40"
                    }`}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* INFO */}
        <h2 className="text-3xl font-bold text-gray-900">
          {post.description}
        </h2>
        <p className="text-sm text-gray-500">
          Publicado em {new Date(post.createdAt).toLocaleString("pt-BR")}
        </p>

        {/* FAVORITO */}
        <button
          onClick={toggleFavorito}
          className="flex items-center gap-2 mt-2 text-lg transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={favoritado ? "#facc15" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="#facc15"
            className="w-7 h-7 transition-all duration-300 ease-in-out"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.07 4.195a.563.563 0 00.424.307l4.63.673a.563.563 0 01.312.96l-3.35 3.27a.563.563 0 00-.162.498l.79 4.6a.563.563 0 01-.817.593l-4.137-2.176a.563.563 0 00-.524 0l-4.137 2.176a.563.563 0 01-.817-.593l.79-4.6a.563.562 0 00-.162-.498l-3.35-3.27a.563.563 0 01.312-.96l4.63-.673a.563.563 0 00.424-.307l2.07-4.195z"
            />
          </svg>
          {favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        </button>

        {/* LIKE */}
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 mt-2 text-lg transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={liked ? "red" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="red"
            className="w-7 h-7 transition-all duration-300 ease-in-out"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 
               4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 
               4.5 0 010-6.364z"
            />
          </svg>
          {likesCount} curtidas
        </button>

        {/* AUTOR */}
        {autorPost && (
          <Link
            to={`/user/${autorPost.id}`}
            className="block border rounded-xl shadow p-5 flex gap-4 items-center bg-white hover:bg-gray-50 transition"
          >
            <img
              src={autorPost.imagem}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-blue-600 hover:underline">
                {autorPost.nome}
              </p>
              <p className="text-gray-600">{autorPost.email}</p>
              <p className="text-gray-500 text-sm">
                📞 {autorPost.telefone || "Telefone não informado"}
              </p>
            </div>
          </Link>
        )}

        {/* INFO IMÓVEL */}
        <div className="bg-white border rounded-xl p-5 shadow space-y-2">
          <p><strong>Preço:</strong> R$ {post.price}</p>
          <p><strong>Tipo:</strong> {post.type}</p>
          <p><strong>Rua:</strong> {post.street}</p>
          {post.number && (
            <p><strong>Número:</strong> {post.number}</p>
          )}
          <p><strong>Bairro:</strong> {post.avenue}</p>
        </div>

        {/* COMENTÁRIOS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Comentários ({comentarios.length})</h3>
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
                onClick={async () => {
                  if (!novoComentario.trim()) return;

                  const res = await fetch(
                    `http://localhost:8080/api/comments/comment/post/${post.id}`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ content: novoComentario }),
                    }
                  );

                  if (res.ok) {
                    setNovoComentario("");
                    setShowComentarioBox(false);
                    carregarComentarios(post.id);
                  } else {
                    console.error("Falha ao enviar comentário", res.status);
                  }
                }}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow"
              >
                Enviar
              </button>
            </div>
          )}

          {/* COMPONENTE DE COMENTÁRIOS */}
          <Comentarios
            comentarios={comentarios}
            token={token}
            onDelete={(id) => setComentarios((prev) => prev.filter(c => c.id !== id))}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PostagemDetalhada;
