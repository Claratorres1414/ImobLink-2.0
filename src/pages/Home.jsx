import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/posts/feed", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar publicações");
        const data = await res.json();
        setPosts(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar feed:", err);
      });
  }, []);

  const verDetalhes = (postId) => {
    navigate(`/post/${postId}`);
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-6">Imóveis disponíveis</h2>

      {posts.length === 0 ? (
        <p className="text-gray-600">Nenhuma publicação encontrada.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => verDetalhes(post.id)}
              className="bg-white shadow rounded overflow-hidden cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={`http://localhost:8080/api/posts/${post.id}/image`}
                alt="Imagem do imóvel"
                className="w-full max-h-64 object-contain rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.jpg";
                }}
              />
              <div className="p-4 space-y-1">
                <p className="text-gray-800 font-semibold">{post.description}</p>
                <p className="text-gray-600 text-sm">Preço: R$ {post.price}</p>
                <p className="text-gray-600 text-sm">Rua: {post.street}</p>
                <p className="text-gray-600 text-sm">Bairro: {post.avenue}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Publicado em {format(new Date(post.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Home;
