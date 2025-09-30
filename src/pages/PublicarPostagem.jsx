import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function PublicarPostagem() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [street, setStreet] = useState("");
  const [avenue, setAvenue] = useState("");
  const [image, setImage] = useState(null);
  const [gerandoDescricao, setGerandoDescricao] = useState(false); // 🧠 IA
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !price || !street || !avenue || !image) {
      alert("Preencha todos os campos.");
      return;
    }

    if (Number(price) < 0) {
      alert("O preço não pode ser negativo.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("price", price);
    formData.append("street", street);
    formData.append("avenue", avenue);
    formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Publicação criada com sucesso!");
        navigate("/meus-anuncios");
      } else {
        alert("Erro ao criar publicação.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  // 🧠 Função para gerar a descrição com IA
  const gerarDescricaoComIA = async () => {
    if (!image) {
      alert("Selecione uma imagem primeiro.");
      return;
    }

    setGerandoDescricao(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const resposta = await fetch("http://localhost:8000/gerar-legenda", {
        method: "POST",
        body: formData,
      });

      if (!resposta.ok) {
        throw new Error("Erro ao gerar descrição com IA.");
      }

      const dados = await resposta.json();
      setDescription(dados.legenda_pt || ""); // Usa legenda em português
    } catch (erro) {
      console.error(erro);
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setGerandoDescricao(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center mt-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Nova Publicação</h2>

          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Preço"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
          />

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Rua"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Número"
              value={avenue}
              onChange={(e) => setAvenue(e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full"
            />
            <button
              type="button"
              onClick={gerarDescricaoComIA}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
              disabled={gerandoDescricao}
            >
              {gerandoDescricao ? "Gerando..." : "IA"}
            </button>
          </div>

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Publicar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default PublicarPostagem;
