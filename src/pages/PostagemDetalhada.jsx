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

    fetch(`http://localhost:8080/api/posts/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Postagem não encontrada");
        const data = await res.json();
        setPost(data);

        try {
          const resImg = await fetch(`http://localhost:8080/api/images/${id}/post`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          });
          if (resImg.ok) {
            const blob = await resImg.blob();
            createdObjectURL = URL.createObjectURL(blob);
            setImagemSrc(createdObjectURL);
          }
        } catch (err) {
          console.warn("Imagem não carregada", err);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      controller.abort();
      if (createdObjectURL) URL.revokeObjectURL(createdObjectURL);
    };
  }, [id, token]);

  if (!post) return <DashboardLayout><p>Carregando postagem...</p></DashboardLayout>;

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
        <p>Preço: R$ {post.price}</p>
        <p>Rua: {post.street}</p>
        <p>Bairro: {post.neighborhood ?? post.avenue}</p>
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
