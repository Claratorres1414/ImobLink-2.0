import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";


export default function ConversasPage() {
  const [contatos, setContatos] = useState([]);
  const [busca, setBusca] = useState("");
  const [bloqueados, setBloqueados] = useState([]);
  const [mostrarBloqueados, setMostrarBloqueados] = useState(false);

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
      let listaChats = Array.isArray(resposta.data) ? resposta.data : [];

      listaChats = listaChats.filter((chat) => chat.userId !== meuId);

      const listaCompleta = await Promise.all(
        listaChats.map(async (chat) => {
          let foto = "/imagemperfil.jpg";

          try {
            if (chat.imageProfileId) {
              const resImg = await fetch(
                `http://localhost:8080/api/images/get/${chat.imageProfileId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

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
          } catch (err) {
            console.error("Erro ao carregar foto do chat:", err);
          }

          return {
            id: chat.userId,
            name: chat.userName,
            foto,
            ultimaMensagem: chat.lastMessageContent || "",
            remetente: chat.lastMessageFromMe ? "Você" : chat.userName,
            postId: chat.postId || null,
            postDescription: chat.postDescription || "",
            lastMessageAt: chat.lastMessageAt || null,
          };
        })
      );

      setContatos(listaCompleta);
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

  const contatosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return contatos.filter((c) => {
      const estaBloqueado = bloqueados.some((b) => b.id === c.id);
      if (estaBloqueado) return false;

      if (!termo) return true;

      return (
        c.name.toLowerCase().includes(termo) ||
        c.ultimaMensagem.toLowerCase().includes(termo) ||
        c.postDescription.toLowerCase().includes(termo)
      );
    });
  }, [contatos, busca, bloqueados]);

  function abrirConversa(contato) {
    if (contato.postId) {
      navigate(`/chat/${contato.id}?postId=${contato.postId}`);
    } else {
      navigate(`/chat/${contato.id}`);
    }
  }

  function bloquearContato(contato, e) {
    e.stopPropagation();

    const confirmacao = window.confirm(`Deseja bloquear ${contato.name}?`);
    if (!confirmacao) return;

    setBloqueados((prev) => {
      if (prev.some((b) => b.id === contato.id)) return prev;
      return [...prev, contato];
    });
  }

  function desbloquearContato(contatoId) {
    setBloqueados((prev) => prev.filter((b) => b.id !== contatoId));
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <h2 className="text-4xl mb-5 font-semibold">Conversas</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar contato ou mensagem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 bg-white"
          />
        </div>

        <button
          onClick={() => setMostrarBloqueados((v) => !v)}
          className="mb-4 text-blue-600 hover:underline"
        >
          Bloqueados ({bloqueados.length})
        </button>

        {mostrarBloqueados && (
          <div className="mb-4 bg-white border rounded-xl p-3">
            {bloqueados.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum contato bloqueado.</p>
            ) : (
              <div className="space-y-2">
                {bloqueados.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 border rounded-lg p-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={b.foto}
                        alt={b.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="truncate">{b.name}</span>
                    </div>

                    <button
                      onClick={() => desbloquearContato(b.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Desbloquear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {contatosFiltrados.length === 0 ? (
          <p className="text-gray-600">Você ainda não iniciou conversas.</p>
        ) : (
          <div className="space-y-1">
            {contatosFiltrados.map((c) => (
              <div
                key={c.id}
                onClick={() => abrirConversa(c)}
                className="cursor-pointer bg-white hover:bg-gray-50 transition px-4 py-4 border-b flex items-center gap-4"
              >
                <img
                  src={c.foto}
                  alt={c.name}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="truncate text-lg">{c.name}</strong>

                    {c.lastMessageAt && (
                      <span className="text-sm text-gray-400 shrink-0">
                        {new Date(c.lastMessageAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>

                  {c.ultimaMensagem && (
                    <p className="text-gray-500 text-base truncate">
                      <span className="font-semibold">{c.remetente}: </span>
                      {c.ultimaMensagem}
                    </p>
                  )}

                  {c.postDescription && (
                    <p className="text-sm text-blue-600 truncate mt-1">
                      Sobre: {c.postDescription}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => bloquearContato(c, e)}
                  className="text-xs px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 shrink-0"
                  title="Bloquear contato"
                >
                  Bloquear
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}