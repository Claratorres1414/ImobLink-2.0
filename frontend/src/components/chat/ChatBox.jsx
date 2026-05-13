import { useEffect, useState } from "react";

export default function ChatBox({ token, userId }) {

  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    carregarMensagens();
  }, [userId]);

  async function carregarMensagens() {
    const res = await fetch(`http://localhost:8080/api/messages/loadChat/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const arr = await res.json();
    setMensagens(arr);
  }

  async function enviarMensagem() {
    if (input.trim().length === 0) return;

    await fetch(`http://localhost:8080/api/messages/send/${userId}?content=${input}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setInput("");
    carregarMensagens();
  }

  return (
    <div style={{ width: "70%", borderLeft: "1px solid #ccc" }}>
      <div style={{ height: "70vh", padding: 10, overflowY: "auto" }}>
        {mensagens.map(msg => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <strong>{msg.authorName}</strong> <br />
            <span>{msg.content}</span> <br />
            <small>{msg.date}</small>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        <button onClick={enviarMensagem}>Enviar</button>
      </div>
    </div>
  );
}
