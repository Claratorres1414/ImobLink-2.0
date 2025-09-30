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

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // 🔹 Carregar dados atuais da postagem
  useEffect(() => {
    fetch(`http://localhost:8080/api/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar postagem");
        const data = await res.json();
        setDescricao(data.description || "");
        setPreco(data.price || "");
        setRua(data.street || "");
        setNumero(data.houseNumber || "");
        setBairro(data.avenue || "");
        setCarregando(false);

        // 🔹 Garantir que só o dono pode editar
        if (data.authorEmail && localStorage.getItem("userEmail")) {
          if (data.authorEmail !== localStorage.getItem("userEmail")) {
            alert("Você não tem permissão para editar esta postagem.");
            navigate("/home");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setErro("Erro ao carregar a postagem.");
        setCarregando(false);
      });
  }, [id]);

  // 🔹 Salvar alterações
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
    formData.append("houseNumber", numero);
    formData.append("avenue", bairro);
    if (imagem) {
      formData.append("image", imagem);
    }

    try {
      const resposta = await fetch(`http://localhost:8080/api/posts/edit/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

          {/* 🔹 Exibir imagem atual */}
          <img
            src={`http://localhost:8080/api/posts/${id}/image`}
            alt="Imagem atual do imóvel"
            className="w-full max-h-80 object-contain rounded mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.jpg";
            }}
          />

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
