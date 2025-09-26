import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";

function PostagemDetalhada() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar postagem");
        const data = await res.json();
        setPost(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao carregar a postagem.");
        navigate("/home");
      });
  }, [id]);

  if (!post) return null;

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto mt-8">
        <img
          src={`http://localhost:8080/api/posts/${id}/image`}
          alt="Imagem do imóvel"
          className="w-full max-h-[400px] object-contain rounded mb-4"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder.jpg";
          }}
        />

        <h1 className="text-2xl font-bold mb-2">{post.description}</h1>
        <p className="text-gray-600 mb-2">Preço: R$ {post.price}</p>
        <p className="text-gray-600 mb-1">Rua: {post.street}</p>
        <p className="text-gray-600 mb-1">Bairro: {post.avenue}</p>
        <p className="text-gray-600 mb-2">
          Publicado em: {format(new Date(post.createdAt), "dd/MM/yyyy")}
        </p>

        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">Contato</h3>
          <p className="text-gray-700">Nome: {post.authorName}</p>
          <p className="text-gray-700">Telefone: {post.phoneNumber}</p>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-2">Comentários</h3>
          <p className="text-gray-500 text-sm">Sistema de comentários em breve...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PostagemDetalhada;
