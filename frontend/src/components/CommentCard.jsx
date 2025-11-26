import React from "react";

export default function CommentCard({ comentario, token, onDelete }) {
  const { id, autorNome, autorImagem, content, createdAt } = comentario;

  const handleDelete = async () => {
    if (!window.confirm("Deseja realmente deletar este comentário?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/comments/deleteComment/${comentario.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDelete(id);
      } else {
        console.error("Erro ao deletar comentário", res.status);
      }
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
    }
  };

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm flex gap-3 items-start">
      <img
        src={autorImagem || "/imagemperfil.jpg"}
        className="w-10 h-10 rounded-full object-cover"
        alt={autorNome}
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="font-semibold">{autorNome}</p>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Deletar comentário"
          >
            {/* Ícone minimalista de lixeira */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-1">{content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(createdAt).toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
