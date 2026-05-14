import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import TagSelector from "../components/TagSelector";
import { formatarPrecoInput, precoInputParaNumero } from "../utils/formatters";

function EditarPostagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [tipo, setTipo] = useState("");
  const [tags, setTags] = useState([]);

  const [imagensPost, setImagensPost] = useState([]);

  const API = "http://localhost:8080";

  
  // Carregar dados do post
  
  const carregarPostagem = async () => {
    try {
      const res = await fetch(`${API}/api/posts/getOne/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Postagem não encontrada");

      const resposta = await res.json();
      const data = resposta.data || resposta;

      setDescricao(data.description);
      setPreco(formatarPrecoInput(String(Math.round(Number(data.price || 0) * 100))));
      setRua(data.street);
      setNumero(data.number);
      setBairro(data.avenue);
      setTipo(data.type);
      setTags(Array.isArray(data.tags) ? data.tags.map((tag) => tag.name) : []);

      // Carregar todas as imagens do post
      const imgsRes = await fetch(`${API}/api/images/${id}/post/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (imgsRes.ok) {

      const respostaImgs = await imgsRes.json();
      const imgsData = Array.isArray(respostaImgs.data) ? respostaImgs.data : [];

      const imgsComUrl = await Promise.all(
        imgsData.map(async (img) => {
          try {
            const resImg = await fetch(`${API}/api/images/get/${img.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!resImg.ok) return { id: img.id, url: "/placeholder.jpg" };
            const contentType = resImg.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
              const respostaImg = await resImg.json();
              return {
                id: img.id,
                url: respostaImg.data
                  ? `data:image/jpeg;base64,${respostaImg.data}`
                  : "/placeholder.jpg",
              };
            } else {
              const blob = await resImg.blob();
              return {
                id: img.id,
                url: URL.createObjectURL(blob),
              };
            }
          } catch {
            return { id: img.id, url: "/placeholder.jpg" };
          }
        })
      );

        setImagensPost(imgsComUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar postagem.");
      navigate("/meus-anuncios");
    }
  };

  useEffect(() => {
    carregarPostagem();
  }, [id]);


  // Deletar imagem individual
  
  const handleDeleteImage = async (imageId) => {
    if (imagensPost.length <= 1) {
      alert("A postagem deve ter pelo menos uma imagem.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/posts/deleteImage/${id}/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setImagensPost((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert("Não foi possível deletar a imagem.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  
  // Salvar alterações
  
  const salvarAlteracoes = async () => {
    try {
      const res = await fetch(`${API}/api/posts/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: descricao,
          price: precoInputParaNumero(preco),
          street: rua,
          avenue: bairro,
          type: tipo,
          number: numero,
          tags,
        }),
      });

      if (res.ok) {
        alert("Postagem atualizada!");
        navigate("/meus-anuncios");
      } else {
        alert("Erro ao atualizar postagem.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Editar Postagem</h2>

          {/* Mostrar todas as imagens do post com botão de exclusão */}
          <div className="flex gap-3 flex-wrap">
            {imagensPost.map((img) => (
              <div key={img.id} className="relative w-40 h-40">
                <img
                  src={img.url}
                  alt="Imagem do post"
                  className="w-full h-full object-cover rounded"
                />
                {imagensPost.length > 1 && (
                  <button
                    className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Campos do post */}
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Descrição"
          />
          <input
            type="text"
            value={preco}
            onChange={(e) => setPreco(formatarPrecoInput(e.target.value))}
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
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Tipo (aluguel/venda)"
          />

          <TagSelector
            tagsSelecionadas={tags}
            setTagsSelecionadas={setTags}
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
