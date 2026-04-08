import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function ConversasPage() {
  const [contatos, setContatos] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [meuId, setMeuId] = useState(null);

  useEffect(() => {
    async function carregarMeuId() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/user/account", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resposta = await res.json();
        const data = resposta.data || resposta;
        setMeuId(data.id);
      } catch (err) {
        console.error("Erro ao buscar usuário logado:", err);
      }
    }
    carregarMeuId();
  }, [token]);

  async function carregarContatosBackend() {
    try {
      const res = await fetch("http://localhost:8080/api/messages/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const resposta = await res.json();
      let listaUsers = Array.isArray(resposta.data) ? resposta.data : [];

      // Remove o próprio usuário
      listaUsers = listaUsers.filter((u) => u.id !== meuId);

      const listCompleta = await Promise.all(
        listaUsers.map(async (user) => {
          // Foto padrão
          let foto = "/imagemperfil.jpg";
          let ultimaMensagem = "";
          let remetente = "";

          try {
            if (user.imageProfileId) {
              const resImg = await fetch(`http://localhost:8080/api/images/get/${user.imageProfileId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (resImg.ok) {
                const contentType = resImg.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                  const respostaImg = await resImg.json();
                  if (respostaImg.data) {
                    foto = `data:image/jpeg;base64,${respostaImg.data}`;
                  }
                } else {
                  const blob = await resImg.blob();
                  foto = URL.createObjectURL(blob);
                }
              }
            }
          } catch (err) {}

          // Buscar última mensagem
          try {
            const resMsg = await fetch(`http://localhost:8080/api/messages/loadChat/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (resMsg.ok) {
            const respostaMsgs = await resMsg.json();
            const msgs = Array.isArray(respostaMsgs.data) ? respostaMsgs.data : [];

            if (msgs.length > 0) {
              const ultima = msgs[msgs.length - 1];
                ultimaMensagem = ultima.content;
                remetente = ultima.senderId === meuId ? "Você" : user.name;
              }
            }
          } catch (err) {}

          return {
            id: user.id,
            name: user.name,
            foto,
            ultimaMensagem,
            remetente,
          };
        })
      );

      setContatos(listCompleta);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!meuId) return;

    carregarContatosBackend();
    const interval = setInterval(carregarContatosBackend, 5000);

    return () => clearInterval(interval);
  }, [meuId]);

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
              <img
                src={c.foto}
                alt={c.name}
                className="w-12 h-12 rounded-full object-cover"
              />

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
