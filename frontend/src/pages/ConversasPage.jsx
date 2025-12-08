import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function ConversasPage() {
  const [contatos, setContatos] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [meuId, setMeuId] = useState(null);

  useEffect(() => {
    // Buscar ID do usuário logado
    async function carregarMeuId() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/user/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMeuId(data.id);
      } catch (err) {
        console.error("Erro ao buscar usuário logado:", err);
      }
    }

    carregarMeuId();
  }, [token]);

  useEffect(() => {
    if (!meuId) return;

    let interval;
    async function carregarContatos() {
      const contatosSalvos = JSON.parse(localStorage.getItem("contatos") || "[]");

      const contatosComInfo = await Promise.all(
        contatosSalvos
          .filter((c) => c.id && c.id !== meuId) // 🔹 filtra o próprio usuário
          .map(async (c) => {
            let foto = "/imagemperfil.jpg";
            let ultimaMensagem = "";
            let remetente = "";

            // Buscar foto do usuário
            try {
              const resUser = await fetch(`http://localhost:8080/api/user/getAccount/${c.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (resUser.ok) {
                const data = await resUser.json();
                if (data.imageProfileId) {
                  const resImg = await fetch(`http://localhost:8080/api/images/get/${data.imageProfileId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (resImg.ok) {
                    const blob = await resImg.blob();
                    foto = URL.createObjectURL(blob);
                  }
                }
              }
            } catch {}

            // Buscar última mensagem
            try {
              const resMsg = await fetch(`http://localhost:8080/api/messages/loadChat/${c.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (resMsg.ok) {
                const msgs = await resMsg.json();
                if (msgs.length > 0) {
                  const ultima = msgs[msgs.length - 1];
                  ultimaMensagem = ultima.content;
                  remetente = ultima.senderId === meuId ? "Você" : c.name; // 🔹 identifica quem enviou
                }
              }
            } catch {}

            return { ...c, foto, ultimaMensagem, remetente };
          })
      );

      setContatos(contatosComInfo);
    }

    carregarContatos();

    // Polling a cada 5 segundos para atualizar últimas mensagens
    interval = setInterval(carregarContatos, 5000);

    return () => clearInterval(interval);
  }, [token, meuId]);

  return (
    <DashboardLayout>
      <h2 className="text-xl mb-5 font-semibold">Suas Conversas</h2>

      {contatos.length === 0 ? (
        <p className="text-gray-600">Você ainda não iniciou conversas.</p>
      ) : (
        <div className="space-y-4">
          {contatos.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="cursor-pointer p-4 bg-white rounded shadow hover:bg-gray-100 flex items-center gap-4"
            >
              <img src={c.foto} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <strong>{c.name}</strong>
                {c.ultimaMensagem && (
                  <p className="text-gray-500 text-sm truncate">
                    <span className="font-semibold">{c.remetente}: </span>
                    {c.ultimaMensagem}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
