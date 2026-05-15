import { useState } from "react";

function Questionnaire({ onSubmit, onSkip }) {
  const [form, setForm] = useState({
    objective: "",
    propertyType: "",
    priceRange: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">
          Personalize suas recomendações
        </h2>

        <select
          name="objective"
          value={form.objective}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Objetivo</option>
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
        </select>

        <select
          name="propertyType"
          value={form.propertyType}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Tipo do imóvel</option>
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="terreno">Terreno</option>
        </select>

        <select
          name="priceRange"
          value={form.priceRange}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Faixa de preço</option>
          <option value="baixo">Baixo</option>
          <option value="medio">Médio</option>
          <option value="alto">Alto</option>
        </select>

        <button
          onClick={() => onSubmit(form)}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Enviar
        </button>

        <button
          onClick={onSkip}
          className="bg-gray-300 text-black p-2 rounded"
        >
          Pular
        </button>
      </div>
    </div>
  );
}

export default Questionnaire;