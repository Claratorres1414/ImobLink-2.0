import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import LikeButton from "../components/LikeButton";

function PostagemDetalhada() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [autor, setAutor] = useState(null);
  const [imagemSrc, setImagemSrc] = useState("/placeholder.jpg");
  const [likes, setLikes] = useState(0);
  const [jaCurtiu, setJaCurtiu] = useState(false);

  useEffect(() => {
    if (!id) return;

    let controller = new AbortController();
    let createdURL = null;

    async function carregar() {
      try {
        // ✅ Buscar dados da postagem
        const res = await fetch(`http://localhost:8080/api/posts/getOne/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Postagem não encontrada");

        const data = await res.json();
        setPost(data);
        setLikes(data.favedTimes);

        // ✅ Verificação se já curtiu
        const favsRes = await fetch("http://localhost:8080/api/posts/my-favs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (favsRes.ok) {
          const favs = await favsRes.json();
          setJaCurtiu(favs.some((f) => f.id === data.id));
        }

        // ✅ Buscar imagem da postagem
        const img = await fetch(
          `http://localhost:8080/api/images/${id}/post/thumb`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (img.ok) {
          const blob = await img.blob();
          createdURL = URL.createObjectURL(blob);
          setImagemSrc(createdURL);
        }

        // ✅ Autor — implementaremos depois (backend ainda não envia)
        setAutor(null);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      }
    }

    carregar();

    return () => {
      controller.abort();
      if (createdURL) URL.revokeObjectURL(createdURL);
    };
  }, [id, token]);

  // ✅ Curtir
  async function darLike() {
    const res = await fetch(`http://localhost:8080/api/posts/fav/${post.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setJaCurtiu(true);
      setLikes((p) => p + 1);
    }
  }

  // ✅ Remover Like
  async function tirarLike() {
    const res = await fetch(
      `http://localhost:8080/api/posts/unfav/${post.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      setJaCurtiu(false);
      setLikes((p) => p - 1);
    }
  }

  if (!post) {
    return (
      <DashboardLayout>
        <p className="text-center">Carregando postagem...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* ✅ IMAGEM */}
        <img
          src={imagemSrc}
          alt="Imagem do imóvel"
          className="w-full rounded-lg shadow"
        />

        {/* ✅ DESCRIÇÃO */}
        <h2 className="text-2xl font-bold">{post.description}</h2>

        {/* ✅ Botão de Like estilizado */}
        <LikeButton
          liked={jaCurtiu}
          likes={likes}
          onClick={jaCurtiu ? tirarLike : darLike}
        />

        {/* ✅ Infos */}
        <p><strong>Preço:</strong> R$ {post.price}</p>
        <p><strong>Rua:</strong> {post.street}</p>
        <p><strong>Avenida / Bairro:</strong> {post.avenue}</p>
        <p><strong>Número:</strong> {post.number}</p>

        {/* ✅ Datas */}
        <p className="text-gray-500 text-sm">
          Publicado em:{" "}
          {new Date(post.createdAt).toLocaleDateString()} às{" "}
          {new Date(post.createdAt).toLocaleTimeString()}
        </p>

        {post.updatedAt !== post.createdAt && (
          <p className="text-gray-500 text-sm">
            Editado em:{" "}
            {new Date(post.updatedAt).toLocaleDateString()} às{" "}
            {new Date(post.updatedAt).toLocaleTimeString()}
          </p>
        )}

      </div>
    </DashboardLayout>
  );
}

export default PostagemDetalhada;
