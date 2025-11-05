import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function PostagemDetalhada() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [indice, setIndice] = useState(0);

  const [likes, setLikes] = useState(0);
  const [jaCurtiu, setJaCurtiu] = useState(false);

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [showComentarioBox, setShowComentarioBox] = useState(false);

  const [autorPost, setAutorPost] = useState(null);
  const intervalRef = useRef(null);

  // ✅ Buscar foto de perfil
  async function buscarFotoPerfil(imageId) {
    if (!imageId) return "/imagemperfil.jpg";

    const tentativas = [
      `http://localhost:8080/api/images/get/${imageId}`,
      `http://localhost:8080/api/images/${imageId}/profile`,
      `http://localhost:8080/api/images/profile/${imageId}`
    ];

    for (let url of tentativas) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch {}
    }
    return "/imagemperfil.jpg";
  }

  // ✅ Carregar autor
  async function carregarAutor(userId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/getAccount/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return;

      const dados = await res.json();
      const foto = await buscarFotoPerfil(dados.imageProfileId);

      setAutorPost({
        nome: dados.name,
        email: dados.email,
        telefone: dados.phoneNumber,
        imagem: foto
      });
    } catch (err) {
      console.error("Erro ao carregar dados do autor:", err);
    }
  }

  // ✅ Buscar todas as imagens do post
  async function carregarImagens(postId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/images/${postId}/post/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const lista = await res.json();
        const urls = [];

        for (const img of lista) {
          try {
            const f = await fetch(
              `http://localhost:8080/api/images/get/${img.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!f.ok) continue;

            const blob = await f.blob();
            urls.push(URL.createObjectURL(blob));
          } catch {}
        }

        if (urls.length > 0) {
          setImagens(urls);
          return;
        }
      }
    } catch {}

    // fallback: usar thumb
    try {
      const res = await fetch(
        `http://localhost:8080/api/images/${postId}/post/thumb`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const blob = await res.blob();
        setImagens([URL.createObjectURL(blob)]);
        return;
      }
    } catch {}

    setImagens(["/placeholder.jpg"]);
  }

  // ✅ Carregar postagem + imagens + autor + comentários
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/posts/getOne/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Postagem não encontrada");

        const data = await res.json();
        setPost(data);
        setLikes(data.favedTimes);
        carregarAutor(data.userId);
        carregarImagens(data.id);
        carregarComentarios(data.userId);
      } catch (err) {
        console.error(err);
      }
    }

    carregar();
  }, [id]);

  // ✅ Carregar comentários
  async function carregarComentarios(userId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/getComments/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return;

      const lista = await res.json();

      const completos = await Promise.all(
        lista.map(async (c) => {
          let autor = { name: "Usuário" };
          try {
            const r = await fetch(
              `http://localhost:8080/api/user/getAccount/${c.authorId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (r.ok) autor = await r.json();
          } catch {}

          return {
            ...c,
            autorNome: autor.name,
            autorImagem: await buscarFotoPerfil(autor.imageProfileId)
          };
        })
      );

      setComentarios(completos);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  }

  // ✅ Enviar comentário
  async function enviarComentario() {
    if (!novoComentario.trim()) return;

    const res = await fetch(
      `http://localhost:8080/api/comments/comment/${post.userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: novoComentario })
      }
    );

    if (res.ok) {
      setNovoComentario("");
      setShowComentarioBox(false);
      carregarComentarios(post.userId);
    }
  }

  // ✅ Like
  async function darLike() {
    const res = await fetch(
      `http://localhost:8080/api/posts/fav/${post.id}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      setLikes(l => l + 1);
      setJaCurtiu(true);
    }
  }

  async function tirarLike() {
    const res = await fetch(
      `http://localhost:8080/api/posts/unfav/${post.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      setLikes(l => l - 1);
      setJaCurtiu(false);
    }
  }

  // ✅ Slider suave — autoplay
  useEffect(() => {
    if (imagens.length <= 1) return;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setIndice(i => (i + 1) % imagens.length);
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, [imagens]);

  function next() {
    setIndice(i => (i + 1) % imagens.length);
  }

  function prev() {
    setIndice(i => (i - 1 + imagens.length) % imagens.length);
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

        {/* ✅ Slider */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden shadow-lg bg-black">
        <img
          src={imagens[indice]}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
        />


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

        {/* ✅ Título e data */}
        <h2 className="text-3xl font-bold text-gray-900">{post.description}</h2>
        <p className="text-sm text-gray-500">
          Publicado em {new Date(post.createdAt).toLocaleString("pt-BR")}
        </p>

        {/* ✅ Likes */}
        <button
          onClick={jaCurtiu ? tirarLike : darLike}
          className={`px-5 py-2 rounded-full flex items-center gap-2 shadow transition-colors ${
            jaCurtiu ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          👍 {likes}
        </button>

        {/* ✅ Autor */}
        {autorPost && (
          <div className="border rounded-xl shadow p-5 flex gap-4 items-center bg-white">
            <img
              src={autorPost.imagem}
              className="w-16 h-16 rounded-full object-cover border"
            />

            <div className="flex flex-col">
              <p className="text-xl font-semibold">{autorPost.nome}</p>
              <p className="text-gray-600">{autorPost.email}</p>
              <p className="text-gray-500 text-sm">
                📞 {autorPost.telefone || "Telefone não informado"}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Informações do imóvel */}
        <div className="bg-white border rounded-xl p-5 shadow space-y-2">
          <p><strong>Preço:</strong> R$ {post.price}</p>
          <p><strong>Rua:</strong> {post.street}</p>
          <p><strong>Bairro:</strong> {post.avenue}</p>
        </div>

        {/* ✅ Comentários */}
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
                onClick={enviarComentario}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow"
              >
                Enviar
              </button>
            </div>
          )}

          {comentarios.map((c) => (
            <div
              key={c.id}
              className="bg-white border p-4 rounded-xl shadow-sm flex gap-3"
            >
              <img
                src={c.autorImagem}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold">{c.autorNome}</p>
                <p>{c.content}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default PostagemDetalhada;
