export function apenasNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function formatarCPF(valor) {
  const numeros = apenasNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function formatarTelefone(valor) {
  const numeros = apenasNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function limparMascara(valor) {
  return apenasNumeros(valor);
}

export function formatarPreco(valor) {
  const numero = Number(valor);

  if (Number.isNaN(numero)) return "R$ 0,00";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarEndereco(rua, numero, bairro) {
  return {
    linha1: `${rua || "Rua não informada"}${numero ? `, ${numero}` : ""}`,
    linha2: bairro || "Bairro não informado",
  };
}

export function formatarPrecoInput(valor) {
  const numeros = String(valor || "").replace(/\D/g, "");

  if (!numeros) return "";

  const numero = Number(numeros) / 100;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function precoInputParaNumero(valor) {
  const numeros = String(valor || "").replace(/\D/g, "");

  if (!numeros) return 0;

  return Number(numeros) / 100;
}