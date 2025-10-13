import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function EditarPostagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagemSrc, setImagemSrc] = useState("/placeholder.jpg");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

useEffect(() => {
  if (!id) {
    setErro("ID da postagem inválido.");
    setCarregando(false);
    return;
  }

  let controller = new AbortController();
  let createdObjectURL = null;

  async function carregarPostagem() {
    try {
      const urlsPossiveis = [
        `http://localhost:8080/api/posts/${id}`,
        `http://localhost:8080/api/posts/post/${id}`,
      ];

      let data = null;
      for (const url of urlsPossiveis) {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (res.ok) {
          data = await res.json();
          break;
        }
      }

      if (!data) throw new Error("Postagem não encontrada");

      console.log("📦 Dados recebidos:", data);

      setDescricao(data.description || "");
      setPreco(data.price || "");
      setRua(data.street || "");
      setNumero(data.number || "");
      setBairro(data.neighborhood || data.avenue || "");

      // Carregar imagem, se houver
      const imagePath =
        data.imageAdresse || data.imagePath || data.imageUrl || null;
      if (imagePath) {
        const imgRes = await fetch(`http://localhost:8080${imagePath}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (imgRes.ok) {
          const blob = await imgRes.blob();
          createdObjectURL = URL.createObjectURL(blob);
          setImagemSrc(createdObjectURL);
        }
      }

      setCarregando(false);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar a postagem.");
      setCarregando(false);
    }
  }

  carregarPostagem();

  return () => {
    controller.abort();
    if (createdObjectURL) URL.revokeObjectURL(createdObjectURL);
  };
}, [id, token]);


  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!descricao || !preco || !rua || !numero || !bairro) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    const formData = new FormData();
    formData.append("description", descricao);
    formData.append("price", preco);
    formData.append("street", rua);
    formData.append("number", numero);
    formData.append("neighborhood", bairro);
    if (imagem) formData.append("image", imagem);

    try {
      const resposta = await fetch(`http://localhost:8080/api/posts/edit/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (resposta.ok) {
        alert("Postagem atualizada com sucesso!");
        navigate("/meus-anuncios");
      } else {
        setErro("Erro ao salvar alterações.");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  if (carregando) {
    return (
      <DashboardLayout>
        <p className="text-center text-gray-600">Carregando postagem...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-center mt-10">
        <form
          onSubmit={handleSalvar}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4"
        >
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Editar Postagem
          </h2>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
          />

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>

          <input
            type="text"
            placeholder="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <img
            src={imagemSrc}
            alt="Imagem atual"
            className="w-full rounded-lg shadow mt-3 mb-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.jpg";
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagem(e.target.files[0])}
            className="w-full"
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Salvar Alterações
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default EditarPostagem;
