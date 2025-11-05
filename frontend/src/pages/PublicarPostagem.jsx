import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";

function PublicarPostagem() {
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");

  const [imagens, setImagens] = useState([]); // ✅ AGORA SÃO VÁRIAS IMAGENS
  const [preview, setPreview] = useState([]);

  const [erro, setErro] = useState("");
  const [loadingLegenda, setLoadingLegenda] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Gerar legenda (IA) — usa só a primeira imagem
  const gerarLegenda = async () => {
    if (imagens.length === 0) {
      setErro("Selecione pelo menos 1 imagem para gerar a legenda.");
      return;
    }

    setLoadingLegenda(true);
    setErro("");

    const formData = new FormData();
    formData.append("file", imagens[0]); // ✅ usa apenas a primeira imagem

    try {
      const resposta = await fetch("http://localhost:8080/integracao/legenda", {
        method: "POST",
        body: formData,
      });

      if (!resposta.ok) throw new Error("Erro ao gerar legenda.");

      const dados = await resposta.json();

      setDescricao(dados.traduzido || dados.caption || "");
    } catch (err) {
      console.error(err);
      setErro("Erro ao gerar legenda com IA.");
    } finally {
      setLoadingLegenda(false);
    }
  };

  // ✅ Envio de múltiplas imagens
  const handleImagemChange = (e) => {
    const files = Array.from(e.target.files);

    setImagens(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  // ✅ Criar postagem
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descricao || !preco || !rua || !numero || !bairro || imagens.length === 0) {
      setErro("Preencha todos os campos e selecione pelo menos 1 imagem.");
      return;
    }

    setErro("");

    const formData = new FormData();
    formData.append("description", descricao);
    formData.append("price", preco);
    formData.append("street", rua);
    formData.append("number", numero);
    formData.append("avenue", bairro);

    imagens.forEach((img) => formData.append("images", img)); // ✅ várias imagens

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
      setErro("Erro ao conectar ao servidor.");
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

          {/* ✅ INPUT DE MÚLTIPLAS IMAGENS */}
          <div>
            <label className="block font-semibold mb-1">Imagens do imóvel</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagemChange}
              className="w-full"
            />

            {/* ✅ Preview das imagens */}
            {preview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {preview.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={gerarLegenda}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            disabled={loadingLegenda}
          >
            {loadingLegenda ? "Gerando legenda..." : "Gerar Legenda com IA"}
          </button>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Publicar
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default PublicarPostagem;
