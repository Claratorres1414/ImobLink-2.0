import { useEffect, useState } from "react";
import { API_URL, TOKEN_KEY } from "../config/constants";

function TagSelector({ tagsSelecionadas, setTagsSelecionadas }) {
const [texto, setTexto] = useState("");
const [sugestoes, setSugestoes] = useState([]);
const token = localStorage.getItem(TOKEN_KEY);

useEffect(() => {
    async function buscarSugestoes() {
    try {
        const url = texto.trim()
        ? `${API_URL}/tags/search?query=${encodeURIComponent(texto)}`
        : "${API_URL}/tags/suggestions";

        const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const resposta = await res.json();
        const data = Array.isArray(resposta.data) ? resposta.data : [];
        setSugestoes(data);
    } catch (err) {
        console.error("Erro ao buscar tags:", err);
    }
    }

    buscarSugestoes();
}, [texto, token]);

function normalizar(nome) {
    return String(nome || "")
    .trim()
    .toLowerCase();
}

function adicionarTag(nome) {
    const tag = String(nome || "").trim();
    if (!tag) return;

    const jaExiste = tagsSelecionadas.some(
    (t) => normalizar(t) === normalizar(tag),
    );

    if (jaExiste) {
    setTexto("");
    return;
    }

    setTagsSelecionadas([...tagsSelecionadas, tag]);
    setTexto("");
}

function removerTag(tag) {
    setTagsSelecionadas(tagsSelecionadas.filter((t) => t !== tag));
}

return (
    <div className="space-y-3">
    <label className="block font-semibold text-gray-800">
        Tags do imóvel
    </label>

    <div className="flex gap-2">
        <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
            e.preventDefault();
            adicionarTag(texto);
            }
        }}
        placeholder="Ex: Mobiliada, moderna, garagem..."
        className="flex-1 border rounded-lg p-2"
        />

        <button
        type="button"
        onClick={() => adicionarTag(texto)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
        Adicionar
        </button>
    </div>

    {sugestoes.length > 0 && (
    <div>
        <p className="text-xs text-gray-500 mb-2">
        Sugestões de tags
        </p>

        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
        {sugestoes.slice(0, 10).map((tag) => (
            <button
            key={tag.id}
            type="button"
            onClick={() => adicionarTag(tag.name)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full border hover:bg-blue-50 hover:text-blue-700"
            >
            {tag.name}
            </button>
        ))}
        </div>
    </div>
)}

    {tagsSelecionadas.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
        {tagsSelecionadas.map((tag) => (
            <span
            key={tag}
            className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2"
            >
            {tag}
            <button
                type="button"
                onClick={() => removerTag(tag)}
                className="font-bold"
            >
                ×
            </button>
            </span>
        ))}
        </div>
    )}
    </div>
);
}

export default TagSelector;
