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
  const [imagemAtual, setImagemAtual] = useState(null);
  const [novaImagem, setNovaImagem] = useState(null);

  // ---------------------------
  // ✅ Carregar dados da postagem
  // ---------------------------
  const carregarPostagem = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/getOne/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Postagem não encontrada");
      }

      const data = await res.json();

      setDescricao(data.description);
      setPreco(data.price);
      setRua(data.street);
      setNumero(data.number);
      setBairro(data.avenue);

      // ✅ Carregar imagem principal corretamente
      const imgBlob = await fetch(
        `http://localhost:8080/api/images/${id}/post/thumb`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => r.blob());

      setImagemAtual(URL.createObjectURL(imgBlob));
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar postagem.");
      navigate("/meus-anuncios");
    }
  };

  useEffect(() => {
    carregarPostagem();
  }, [id]);


  // ---------------------------
  // ✅ Salvar alterações
  // ---------------------------
  const salvarAlteracoes = async () => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("description", descricao);
    formData.append("price", preco);
    formData.append("street", rua);
    formData.append("number", numero);
    formData.append("avenue", bairro);

    if (novaImagem) {
      formData.append("image", novaImagem);
    }

    try {
      const res = await fetch("http://localhost:8080/api/posts/update", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("Postagem atualizada!");
        navigate("/meus-anuncios");
      } else {
        alert("Erro ao atualizar postagem.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Postagem
          </h2>

          {/* ✅ IMAGEM */}
          {imagemAtual && (
            <img
              src={imagemAtual}
              alt="Imagem atual"
              className="w-full rounded border"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNovaImagem(e.target.files[0])}
          />

          {/* ✅ CAMPOS */}
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Descrição"
          />

          <input
            type="number"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Preço"
          />

          <input
            type="text"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Rua"
          />

          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Número"
          />

          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Bairro"
          />

          <button
            onClick={salvarAlteracoes}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditarPostagem;
