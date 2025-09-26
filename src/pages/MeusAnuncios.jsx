import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

function MeusAnuncios() {
  const [posts, setPosts] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [imagem, setImagem] = useState(null);
  const [gerandoDescricao, setGerandoDescricao] = useState(false);
  const [mostrarTooltip, setMostrarTooltip] = useState(false); // 🧠 IA Tooltip

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const carregarPosts = () => {
    fetch("http://localhost:8080/api/posts/my-posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao buscar publicações");
        const data = await res.json();
        console.log("POSTS RECEBIDOS:", data);
        setPosts(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    carregarPosts();
  }, []);

  // 🧠 Tooltip control
  useEffect(() => {
    if (imagem) {
      setMostrarTooltip(true);
      const timer = setTimeout(() => setMostrarTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [imagem]);

  const publicar = async (e) => {
    e.preventDefault();
    if (!imagem) return alert("Selecione uma imagem");
    if (
      descricao.trim() === "" ||
      preco <= 0 ||
      rua.trim() === "" ||
      bairro.trim() === "" ||
      numero.trim() === ""
    ) {
      return alert("Preencha todos os campos corretamente.");
    }

    const formData = new FormData();
    formData.append("description", descricao);
    formData.append("price", preco);
    formData.append("street", rua);
    formData.append("avenue", bairro);
    formData.append("image", imagem);

    try {
      const resposta = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resposta.ok) throw new Error("Erro ao publicar");

      setDescricao("");
      setPreco("");
      setRua("");
      setNumero("");
      setBairro("");
      setImagem(null);
      setMostrarFormulario(false);
      carregarPosts();
    } catch (error) {
      console.error(error);
      alert("Erro ao publicar o anúncio.");
    }
  };

  const gerarDescricaoComIA = async () => {
    if (!imagem) {
      alert("Selecione uma imagem primeiro.");
      return;
    }

    setGerandoDescricao(true);

    const formData = new FormData();
    formData.append("file", imagem);

    try {
      const resposta = await fetch("http://localhost:8000/gerar-legenda", {
        method: "POST",
        body: formData,
      });

      if (!resposta.ok) throw new Error("Erro ao gerar descrição");

      const dados = await resposta.json();
      setDescricao(dados.legenda_pt || "");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setGerandoDescricao(false);
    }
  };

  const handleExcluir = async (id) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta publicação?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      } else {
        alert("Erro ao excluir publicação.");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleEditar = (id) => {
    navigate(`/editar-postagem/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meus Anúncios</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          Nova Publicação
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white shadow p-6 rounded max-w-xl mb-6 relative">
          <h3 className="text-xl font-bold mb-4">Nova Publicação</h3>

          {imagem && (
            <div className="mb-4">
              <img
                src={URL.createObjectURL(imagem)}
                alt="Prévia da imagem"
                className="w-full max-h-80 object-cover rounded-lg shadow border"
              />
            </div>
          )}

          <form onSubmit={publicar} className="space-y-3">
            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Preço"
              value={preco}
              min="0"
              onChange={(e) => setPreco(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-1/3 border p-2 rounded"
              />
            </div>
            <input
              type="text"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="w-full"
            />
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Publicar
            </button>
          </form>

          {/* 🧠 Balão/tooltip acima do botão IA */}
          {imagem && mostrarFormulario && mostrarTooltip && (
            <div className="fixed bottom-24 right-6 bg-gray-800 text-white text-sm px-4 py-2 rounded shadow-lg animate-fadeIn z-50">
              Se quiser ajuda para descrever a imagem, clique aqui!
            </div>
          )}


          {/* 🧠 Botão flutuante da IA */}
          <button
            onClick={gerarDescricaoComIA}
            disabled={gerandoDescricao}
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 z-50"
            title="Gerar descrição com IA"
          >
            {gerandoDescricao ? (
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <img src="/robo.png" alt="IA" className="w-w-11 h-11 object-contain" />
            )}
          </button>
        </div>
      )}

      {!mostrarFormulario && posts.length === 0 && (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="mb-4 text-gray-600">Você ainda não possui nenhuma publicação.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow rounded overflow-hidden">
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
              <p className="text-gray-600 text-sm">Nº: {post.houseNumber}</p>
              <p className="text-gray-600 text-sm">Bairro: {post.avenue}</p>
              <p className="text-gray-400 text-xs mt-2">
                Publicado em {format(new Date(post.createdAt), "dd/MM/yyyy")}
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => handleEditar(post.id)}
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
    </DashboardLayout>
  );
}

export default MeusAnuncios;
