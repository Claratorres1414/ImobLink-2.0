import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Buscar anúncios do usuário
  useEffect(() => {
    fetch("http://localhost:8080/api/posts/my-posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar anúncios");
        const data = await res.json();
        setPosts(data);
        setCarregando(false);
      })
      .catch((err) => {
        console.error(err);
        setErro("Erro ao carregar seus anúncios.");
        setCarregando(false);
      });
  }, []);

  // 🔹 Excluir postagem
  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este anúncio?")) return;

    try {
      const resposta = await fetch(`http://localhost:8080/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resposta.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      } else {
        alert("Erro ao excluir anúncio.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600">Carregando seus anúncios...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Meus Anúncios</h2>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        {posts.length === 0 ? (
          <p className="text-gray-600">Você ainda não publicou nenhum anúncio.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={`http://localhost:8080/api/posts/${post.id}/image`}
                  alt={post.description}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {post.description}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    R$ {post.price} – {post.street}, {post.houseNumber},{" "}
                    {post.avenue}
                  </p>

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => navigate(`/editar-postagem/${post.id}`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(post.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MeusAnuncios;
