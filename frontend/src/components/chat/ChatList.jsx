import { useEffect, useState } from "react";
import { API_URL, TOKEN_KEY } from "../../config/constants";

export default function ChatList({ onSelectChat }) {
  const [conversations, setConversations] = useState([]);
  const token = localStorage.getItem(TOKEN_KEY);

  console.log("ChatList carregou!");

  useEffect(() => {
    console.log("Chamando backend...");

    fetch("${API_URL}/messages/loadChat/1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        console.log("Status da API:", res.status);

        if (!res.ok) {
          throw new Error("Erro ao carregar conversas");
        }

        const data = await res.json();
        console.log("Resposta da API:", data);

        setConversations(data);
      })
      .catch((err) => {
        console.error("Erro FETCH:", err);
      });
  }, []);

  return (
    <div className="w-1/3 bg-white border rounded-md p-4 h-[80vh] overflow-y-auto shadow-sm">

      <h2 className="text-xl font-bold mb-3">Conversas</h2>

      {conversations.length === 0 && (
        <p className="text-gray-500">Nenhuma conversa encontrada.</p>
      )}

      {conversations.map((conv, index) => (
        <div
          key={index}
          className="p-3 border-b cursor-pointer hover:bg-gray-100 transition"
          onClick={() => onSelectChat(conv)}
        >
          Conversa com ID: <strong>{conv.senderId}</strong>
          <br />
          Última mensagem: <span className="text-gray-600">{conv.content}</span>
        </div>
      ))}
    </div>
  );
}
