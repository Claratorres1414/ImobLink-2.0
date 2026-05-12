import React from "react";
import CommentCard from "./CommentCard";

export default function Comentarios({ comentarios, token, onDelete }) {
  return (
    <div className="space-y-4">
      {comentarios.length === 0 ? (
        <p className="text-gray-500">Nenhum comentário ainda.</p>
      ) : (
        comentarios.map((c) => (
          <CommentCard
            key={c.id}
            comentario={c}
            token={token}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
