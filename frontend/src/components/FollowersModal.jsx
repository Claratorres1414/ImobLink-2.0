import React from "react";

/**
 * Props:
 * - type: 'followers' | 'followings'
 * - users: array of user objects (each should contain id, name, email, imageProfileId optional)
 * - onClose: () => void
 * - onOpenProfile: (id) => void
 */
export default function FollowersModal({ type = "followers", users = [], onClose, onOpenProfile }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-lg">
            {type === "followers" ? "Seguidores" : "Seguindo"}
          </h4>
          <button onClick={onClose} className="text-gray-600 px-2 py-1 hover:bg-gray-100 rounded">
            Fechar
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Nenhum usuário</div>
          ) : (
            <ul className="divide-y">
              {users.map((u, idx) => (
                <li key={u?.id ?? idx} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <img
                    src={u?.imageProfileId ? `http://localhost:8080/api/images/get/${u.imageProfileId}` : "/imagemperfil.jpg"}
                    alt={u?.name || u?.email}
                    className="w-12 h-12 rounded-full object-cover border"
                    onError={(e) => (e.currentTarget.src = "/imagemperfil.jpg")}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{u?.name || u?.email}</div>
                    <div className="text-xs text-gray-500">{u?.email || ""}</div>
                  </div>

                  <div>
                    <button
                      onClick={() => onOpenProfile(u?.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      Ver perfil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
