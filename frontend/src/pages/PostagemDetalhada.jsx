import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function PostagemDetalhada() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [imagemSrc, setImagemSrc] = useState("/placeholder.jpg");

  const [likes, setLikes] = useState(0);
  const [jaCurtiu, setJaCurtiu] = useState(false);

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [showComentarioBox, setShowComentarioBox] = useState(false);

  const [autorPost, setAutorPost] = useState(null);

  async function buscarFotoPerfil(imageId) {
    if (!imageId) return "/imagemperfil.jpg";

    const tentativas = [
      `http://localhost:8080/api/images/get/${imageId}`,
      `http://localhost:8080/api/images/${imageId}/profile`,
      `http://localhost:8080/api/images/profile/${imageId}`,
    ];

    for (let url of tentativas) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch {}
    }

    return "/imagemperfil.jpg";
  }

  async function carregarAutor(userId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/getAccount/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return;

      const dados = await res.json();
      const fotoAutor = await buscarFotoPerfil(dados.imageProfileId);

      setAutorPost({
        nome: dados.name,
        email: dados.email,
        telefone: dados.phoneNumber,
        imagem: fotoAutor,
      });
    } catch (err) {
      console.error("Erro ao carregar dados do autor:", err);
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        const resPost = await fetch(
          `http://localhost:8080/api/posts/getOne/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!resPost.ok) throw new Error("Postagem não encontrada");

        const data = await resPost.json();
        setPost(data);
        setLikes(data.favedTimes);

        carregarAutor(data.userId);

        const imgRes = await fetch(
          `http://localhost:8080/api/images/${id}/post/thumb`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (imgRes.ok) {
          const blob = await imgRes.blob();
          setImagemSrc(URL.createObjectURL(blob));
        }

        carregarComentarios(data.userId);
      } catch (err) {
        console.error(err);
      }
    }

    carregar();
  }, [id]);

  async function carregarComentarios(userId) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/getComments/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return;

      const data = await res.json();

      const lista = await Promise.all(
        data.map(async (c) => {
          const userRes = await fetch(
            `http://localhost:8080/api/user/getAccount/${c.authorId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let userData = {};
          if (userRes.ok) userData = await userRes.json();

          return {
            ...c,
            autorNome: userData.name || "Usuário",
            autorImagem: await buscarFotoPerfil(userData.imageProfileId),
          };
        })
      );

      setComentarios(lista);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  }

  async function enviarComentario() {
    if (!novoComentario.trim()) return;

    const res = await fetch(
      `http://localhost:8080/api/comments/comment/${post.userId}`,
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
      carregarComentarios(post.userId);
    }
  }

  async function darLike() {
    const res = await fetch(
      `http://localhost:8080/api/posts/fav/${post.id}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      setLikes((l) => l + 1);
      setJaCurtiu(true);
    }
  }

  async function tirarLike() {
    const res = await fetch(
      `http://localhost:8080/api/posts/unfav/${post.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      setLikes((l) => l - 1);
      setJaCurtiu(false);
    }
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

        {/* ✅ Imagem principal */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img src={imagemSrc} className="w-full" />
        </div>

        {/* ✅ Título e data */}
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {post.description}
        </h2>

        <p className="text-sm text-gray-500 -mt-2">
          Publicado em: {new Date(post.createdAt).toLocaleString("pt-BR")}
        </p>

        {/* ✅ Botão de like */}
        <div>
          <button
            onClick={jaCurtiu ? tirarLike : darLike}
            className={`px-5 py-2 rounded-full flex items-center gap-2 shadow transition-colors
              ${jaCurtiu ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}
            `}
          >
            👍 Curtir · {likes}
          </button>
        </div>

        {/* ✅ Card do proprietário */}
        {autorPost && (
          <div className="border rounded-xl shadow p-5 flex gap-4 items-center bg-white">
            <img
              src={autorPost.imagem}
              className="w-16 h-16 rounded-full object-cover border"
            />

            <div className="flex flex-col">
              <p className="text-xl font-semibold text-gray-900">
                {autorPost.nome}
              </p>
              <p className="text-gray-600">{autorPost.email}</p>
              <p className="text-gray-500 text-sm">
                📞 {autorPost.telefone || "Telefone não informado"}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Informações do imóvel */}
        <div className="bg-white border rounded-xl p-5 shadow space-y-2">
          <p className="text-lg">
            <strong className="text-gray-900">Preço:</strong> R$ {post.price}
          </p>
          <p>
            <strong className="text-gray-900">Rua:</strong> {post.street}
          </p>
          <p>
            <strong className="text-gray-900">Bairro:</strong> {post.avenue}
          </p>
        </div>

        {/* ✅ Seção de comentários */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Comentários ({comentarios.length})
            </h3>

            {/* ✅ Botão para abrir caixa de comentário */}
            <button
              onClick={() => setShowComentarioBox((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
            >
              {showComentarioBox ? "Cancelar" : "+ Adicionar comentário"}
            </button>
          </div>

          {/* ✅ Caixa de comentário (agora no topo) */}
          {showComentarioBox && (
            <div className="mt-3 bg-white p-4 border rounded-xl shadow">
              <textarea
                className="w-full border p-3 rounded-xl"
                placeholder="Escreva seu comentário..."
                rows={3}
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
              ></textarea>

              <button
                onClick={enviarComentario}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
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
                <p className="font-semibold text-gray-900">{c.autorNome}</p>
                <p className="text-gray-700">{c.content}</p>

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
