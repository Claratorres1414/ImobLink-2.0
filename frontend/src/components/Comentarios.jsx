import { useEffect, useState } from "react";

function CommentSection({ postId }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const token = localStorage.getItem("token");

  // ✅ Carregar comentários da postagem
  async function carregarComentarios() {
    try {
      const res = await fetch(`http://localhost:8080/api/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setComentarios(data);
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  }

  useEffect(() => {
    carregarComentarios();
  }, [postId]);

  // ✅ Enviar novo comentário
  async function enviarComentario(e) {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/create/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: novoComentario }),
        }
      );

      if (res.ok) {
        setNovoComentario("");
        carregarComentarios(); // ✅ atualiza lista instantaneamente
      }
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  }

  return (
    <div className="mt-8 bg-white shadow p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Comentários</h3>

      {/* ✅ Campo de comentário */}
      <form onSubmit={enviarComentario} className="flex gap-2 mb-4">
        <input
          type="text"
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          Enviar
        </button>
      </form>

      {/* ✅ Lista de comentários */}
      <div className="space-y-3">
        {comentarios.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum comentário ainda.</p>
        ) : (
          comentarios.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-gray-100 rounded border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-1">
                {/* ✅ Imagem do autor */}
                {c.authorImageId ? (
                  <img
                    src={`http://localhost:8080/api/images/get/${c.authorImageId}`}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="autor"
                    onError={(e) => {
                      e.target.src = "/user-placeholder.png";
                    }}
                  />
                ) : (
                  <img
                    src="/user-placeholder.png"
                    className="w-8 h-8 rounded-full"
                  />
                )}

                <strong>{c.authorName}</strong>
              </div>

              <p className="text-gray-700">{c.content}</p>

              {c.createdAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
