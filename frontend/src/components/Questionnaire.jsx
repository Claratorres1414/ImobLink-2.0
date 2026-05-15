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
const [step, setStep] = useState(1);

function nextStep() {
  setStep((prev) => prev + 1);
}

function prevStep() {
  setStep((prev) => prev - 1);
}
  return (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">
        Personalize suas recomendações
      </h2>

      {step === 1 && (
        <>
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

          <button
            disabled={!form.objective}
            onClick={nextStep}
            className="bg-blue-600 text-white p-2 rounded disabled:bg-gray-300"
          >
            Próximo
          </button>
        </>
      )}

      {step === 2 && (
        <>
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

          <div className="flex gap-2">
            <button onClick={prevStep} className="bg-gray-300 p-2 rounded w-full">
              Voltar
            </button>
            <button
              disabled={!form.propertyType}
              onClick={nextStep}
              className="bg-blue-600 text-white p-2 rounded w-full disabled:bg-gray-300"
            >
              Próximo
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <select
            name="priceRange"
            value={form.priceRange}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Faixa de preço</option>

            {form.objective === "aluguel" ? (
              <>
                <option value="baixo">Até R$1000</option>
                <option value="medio">R$1000 - R$3500</option>
                <option value="alto">Acima de R$3500</option>
              </>
            ) : (
              <>
                <option value="baixo">Até R$200 mil</option>
                <option value="medio">R$200 mil - R$500 mil</option>
                <option value="alto">Acima de R$500 mil</option>
              </>
            )}
          </select>

          <div className="flex gap-2">
            <button onClick={prevStep} className="bg-gray-300 p-2 rounded w-full">
              Voltar
            </button>
            <button
              disabled={!form.priceRange}
              onClick={() => onSubmit(form)}
              className="bg-green-600 text-white p-2 rounded w-full disabled:bg-gray-300"
            >
              Finalizar
            </button>
          </div>
        </>
      )}

      <button
        onClick={onSkip}
        className="text-sm text-gray-500 underline mt-2"
      >
        Pular questionário
      </button>
    </div>
  </div>
);}
export default Questionnaire;