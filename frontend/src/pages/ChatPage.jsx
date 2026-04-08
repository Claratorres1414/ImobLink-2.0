import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function ChatPage() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [usuarioAlvo, setUsuarioAlvo] = useState(null);
  const [meuId, setMeuId] = useState(null);

  useEffect(() => {
    carregarUsuarioAlvo();
    carregarMensagens();
    buscarMeuId();
    // eslint-disable-next-line
  }, [id]);

  async function buscarMeuId() {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/user/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar usuário logado");
      const resposta = await res.json();
      const data = resposta.data || resposta;
      setMeuId(data.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarUsuarioAlvo() {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/user/getAccount/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar usuário alvo");
      const resposta = await res.json();
      const data = resposta.data || resposta;
      setUsuarioAlvo(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarMensagens() {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/messages/loadChat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar mensagens");
      const resposta = await res.json();
      const data = Array.isArray(resposta.data) ? resposta.data : [];
      setMensagens(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function enviarMensagem() {
    if (!texto.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/messages/send/${id}?content=${encodeURIComponent(texto)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Erro ao enviar mensagem");
      setTexto("");
      carregarMensagens();
    } catch (err) {
      console.error(err);
    }
  }

  async function deletarMensagem(messageId) {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/messages/delete/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar mensagem");
      setMensagens((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <DashboardLayout>
      <h2 className="text-xl font-semibold mb-4 px-4">
        {usuarioAlvo ? `Conversando com ${usuarioAlvo.name}` : "Carregando..."}
      </h2>

      <div className="flex flex-col px-4 h-[85vh] pb-[70px] relative">
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {mensagens.length === 0 && (
            <p className="text-gray-500 text-center mt-10">Nenhuma mensagem ainda. Inicie a conversa!</p>
          )}
          {Array.isArray(mensagens) && mensagens.map((msg) => {
            const isMe = msg.senderId === meuId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={`relative p-3 rounded-lg break-words
                    ${isMe ? "bg-green-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"}
                    max-w-[70%]`}
                >
                  {isMe && (
                    <button
                      onClick={() => deletarMensagem(msg.id)}
                      className="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 transition text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">
                    {msg.sendedAt && new Date(msg.sendedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 p-3 bg-white border-t border-gray-300 fixed bottom-0 left-0 right-0 max-w-[calc(100%-260px)] ml-[260px]">
          <input
            className="flex-grow border rounded-lg p-2"
            placeholder="Digite sua mensagem..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
          />
          <button
            onClick={enviarMensagem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
          >
            Enviar
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
