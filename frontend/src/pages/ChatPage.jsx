import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function ChatPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const postId = searchParams.get("postId");

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [usuarioAlvo, setUsuarioAlvo] = useState(null);
  const [meuId, setMeuId] = useState(null);
  const [postRelacionado, setPostRelacionado] = useState(null);
  const [anexarPostNaProximaMensagem, setAnexarPostNaProximaMensagem] = useState(false);

  const [editandoMensagemId, setEditandoMensagemId] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState("");

  const [mensagemParaExcluir, setMensagemParaExcluir] = useState(null);
  const [fotoUsuarioAlvo, setFotoUsuarioAlvo] = useState("/imagemperfil.jpg");

  const fimMensagensRef = useRef(null);

  useEffect(() => {
    buscarMeuId();
    carregarUsuarioAlvo();
    carregarMensagens();

    if (postId) {
      carregarPostRelacionado(postId);
      setAnexarPostNaProximaMensagem(true);
    } else {
      setPostRelacionado(null);
      setAnexarPostNaProximaMensagem(false);
    }
    // eslint-disable-next-line
  }, [id, postId]);

  useEffect(() => {
    const interval = setInterval(() => {
      carregarMensagens();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    scrollParaUltimaMensagem();
  }, [mensagens]);

  function scrollParaUltimaMensagem() {
    setTimeout(() => {
      fimMensagensRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function buscarFotoPerfil(imageId) {
    if (!imageId) return "/imagemperfil.jpg";

    try {
      const res = await fetch(
        `http://localhost:8080/api/images/get/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) return "/imagemperfil.jpg";

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const resposta = await res.json();
        if (resposta.data) {
          return `data:image/jpeg;base64,${resposta.data}`;
        }
      } else {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch {}

    return "/imagemperfil.jpg";
  }

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

      const foto = await buscarFotoPerfil(data.imageProfileId);
      setFotoUsuarioAlvo(foto);
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

  async function carregarPostRelacionado(postIdAtual) {
    if (!token || !postIdAtual) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/getOne/${postIdAtual}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao buscar post relacionado");

      const resposta = await res.json();
      const data = resposta.data || resposta;
      setPostRelacionado(data);
    } catch (err) {
      console.error(err);
      setPostRelacionado(null);
    }
  }

  async function enviarMensagem() {
    if (!texto.trim()) return;

    try {
      const body = {
        content: texto,
        postId: anexarPostNaProximaMensagem ? postRelacionado?.id || null : null,
      };

      const res = await fetch(`http://localhost:8080/api/messages/send/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem");

      setTexto("");
      setAnexarPostNaProximaMensagem(false);
      setPostRelacionado(null);

      if (postId) {
        navigate(`/chat/${id}`, { replace: true });
      }

      await carregarMensagens();
      scrollParaUltimaMensagem();
    } catch (err) {
      console.error(err);
    }
  }

  function pedirConfirmacaoExclusao(messageId) {
    setMensagemParaExcluir(messageId);
  }

  async function confirmarExclusaoMensagem() {
    if (!token || !mensagemParaExcluir) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/messages/delete/${mensagemParaExcluir}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Erro ao deletar mensagem");

      setMensagens((prev) => prev.filter((m) => m.id !== mensagemParaExcluir));
      setMensagemParaExcluir(null);
    } catch (err) {
      console.error(err);
    }
  }

  function iniciarEdicao(msg) {
    setEditandoMensagemId(msg.id);
    setTextoEdicao(msg.content);
  }

  function cancelarEdicao() {
    setEditandoMensagemId(null);
    setTextoEdicao("");
  }

  async function salvarEdicao(messageId) {
    if (!textoEdicao.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/messages/edit/${messageId}?content=${encodeURIComponent(textoEdicao)}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Erro ao editar mensagem");

      setMensagens((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: textoEdicao,
                editado: true,
                editadoEm: new Date().toISOString(),
              }
            : m
        )
      );

      cancelarEdicao();
      scrollParaUltimaMensagem();
    } catch (err) {
      console.error(err);
    }
  }

  function abrirPost(postIdMsg) {
    navigate(`/post/${postIdMsg}`);
  }

  function removerAnexoDaProximaMensagem() {
    setAnexarPostNaProximaMensagem(false);
    setPostRelacionado(null);
    navigate(`/chat/${id}`, { replace: true });
  }

  function abrirPerfilUsuarioAlvo() {
    if (!usuarioAlvo) return;

    if (Number(usuarioAlvo.id) === Number(meuId)) {
      navigate("/perfil");
    } else {
      navigate(`/user/${usuarioAlvo.id}`);
    }
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col overflow-hidden -m-6">
        {/* TOPO DO CHAT */}
        <button
          onClick={abrirPerfilUsuarioAlvo}
          className="flex items-center gap-3 px-4 py-3 border-b bg-white hover:bg-gray-50 transition text-left shrink-0"
        >
          <img
            src={fotoUsuarioAlvo}
            alt={usuarioAlvo?.name || "Usuário"}
            className="w-11 h-11 rounded-full object-cover border"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {usuarioAlvo ? usuarioAlvo.name : "Carregando..."}
            </p>
            <p className="text-sm text-gray-500 truncate">Ver perfil</p>
          </div>
        </button>

        {/* ÁREA DAS MENSAGENS */}
        <div className="flex-1 min-h-0 max-h-full overflow-y-auto px-4 py-4 space-y-2 bg-[#f5f5f5]">
          {mensagens.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          )}

          {Array.isArray(mensagens) &&
            mensagens.map((msg) => {
              const isMe = msg.senderId === meuId;
              const estaEditando = editandoMensagemId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                >
                  <div
                    className={`relative p-3 rounded-lg break-words ${
                      isMe
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                    } max-w-[70%]`}
                  >
                    {isMe && !estaEditando && (
                      <div className="absolute -left-12 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => iniciarEdicao(msg)}
                          className="text-sm"
                          title="Editar"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => pedirConfirmacaoExclusao(msg.id)}
                          className="text-sm text-red-600 font-bold"
                          title="Deletar"
                        >
                          ✖
                        </button>
                      </div>
                    )}

                    {msg.postId && (
                      <button
                        onClick={() => abrirPost(msg.postId)}
                        className={`mb-2 block w-full text-left border rounded-lg p-2 ${
                          isMe
                            ? "bg-green-400/40 border-green-200"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <p className="text-xs opacity-80 mb-1">Anúncio relacionado</p>
                        <p className="text-sm font-semibold truncate">
                          {msg.postDescription}
                        </p>
                        <p className="text-xs">R$ {msg.postPrice}</p>
                      </button>
                    )}

                    {estaEditando ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full rounded p-2 text-black"
                          rows={3}
                          value={textoEdicao}
                          onChange={(e) => setTextoEdicao(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelarEdicao}
                            className="px-3 py-1 bg-gray-300 text-black rounded"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => salvarEdicao(msg.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{msg.content}</p>

                        <div className="text-[10px] opacity-70 mt-1 text-right space-y-1">
                          <p>
                            {msg.sendedAt &&
                              new Date(msg.sendedAt).toLocaleString("pt-BR")}
                          </p>

                          {msg.editado && msg.editadoEm && (
                            <p className="italic">
                              editada em{" "}
                              {new Date(msg.editadoEm).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

          <div ref={fimMensagensRef} />
        </div>

        {/* ÁREA DE ENVIO */}
        <div className="border-t bg-white shrink-0">
          {anexarPostNaProximaMensagem && postRelacionado && (
            <div className="px-3 pt-3">
              <div className="bg-gray-100 border rounded-lg p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    Anúncio anexado à próxima mensagem
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {postRelacionado.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    R$ {postRelacionado.price}
                  </p>
                </div>

                <button
                  onClick={removerAnexoDaProximaMensagem}
                  className="text-red-600 font-bold text-sm"
                  title="Remover anexo"
                >
                  ✖
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 p-3">
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
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {mensagemParaExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Excluir mensagem</h3>
            <p className="text-gray-600 mb-5">
              Tem certeza que deseja excluir esta mensagem?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMensagemParaExcluir(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExclusaoMensagem}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}