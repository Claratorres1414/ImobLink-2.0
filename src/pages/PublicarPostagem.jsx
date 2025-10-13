import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function PublicarPostagem() {
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !preco || !rua || !numero || !bairro || !imagem) {
      setErro("Preencha todos os campos e selecione uma imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("description", descricao);
    formData.append("price", preco);
    formData.append("street", rua);
    formData.append("number", numero);
    formData.append("avenue", bairro);
    formData.append("image", imagem);

    try {
      const resposta = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (resposta.ok) {
        alert("Publicação criada com sucesso!");
        navigate("/meus-anuncios");
      } else {
        setErro("Erro ao criar a publicação.");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center mt-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4"
        >
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Nova Publicação
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

          <input
            type="text"
            placeholder="Rua"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full p-2 border rounded"
          />

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
            Publicar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default PublicarPostagem;
