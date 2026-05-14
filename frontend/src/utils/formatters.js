export function formatarPreco(valor) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) return "R$ 0,00";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarTelefone(telefone) {
  if (!telefone) return "Telefone não informado";

  const numeros = String(telefone).replace(/\D/g, "");

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return telefone;
}

export function formatarEndereco(rua, numero, bairro) {
  return {
    linha1: `${rua || "Rua não informada"}${numero ? `, ${numero}` : ""}`,
    linha2: bairro || "Bairro não informado",
  };
}