import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function PostagemDetalhada() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [imagemSrc, setImagemSrc] = useState("/placeholder.jpg");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    let controller = new AbortController();
    let createdObjectURL = null;

    async function carregar() {
      try {
        // ✅ Buscar dados da postagem usando o endpoint certo
        const res = await fetch(`http://localhost:8080/api/posts/getOne/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Postagem não encontrada");
        }

        const data = await res.json();
        setPost(data);

        // ✅ Buscar miniatura da imagem usando o endpoint novo
        const imgRes = await fetch(
          `http://localhost:8080/api/images/${id}/post/thumb`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (imgRes.ok) {
          const blob = await imgRes.blob();
          createdObjectURL = URL.createObjectURL(blob);
          setImagemSrc(createdObjectURL);
        }

      } catch (err) {
        console.error("Erro ao carregar postagem:", err);
      }
    }

    carregar();

    return () => {
      controller.abort();
      if (createdObjectURL) URL.revokeObjectURL(createdObjectURL);
    };
  }, [id, token]);

  if (!post) {
    return (
      <DashboardLayout>
        <p className="text-center">Carregando postagem...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <img
          src={imagemSrc}
          alt="Imagem do imóvel"
          className="w-full rounded-lg shadow"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder.jpg";
          }}
        />
        <h2 className="text-2xl font-bold">{post.description}</h2>

        <p className="text-lg">
          <strong>Preço:</strong> R$ {post.price}
        </p>

        <p>
          <strong>Rua:</strong> {post.street}
        </p>

        <p>
          <strong>Bairro / Avenida:</strong> {post.avenue}
        </p>

        <p>
          <strong>Número:</strong> {post.number}
        </p>

        {post.createdAt && (
          <p className="text-gray-500 text-sm">
            Publicado em {new Date(post.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PostagemDetalhada;
