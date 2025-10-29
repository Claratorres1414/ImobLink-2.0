import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const [imagemFrente, setImagemFrente] = useState(null);
  const [imagemVerso, setImagemVerso] = useState(null);

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !email || !cpf || !telefone || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nome,
          email,
          cpf,
          phoneNumber: telefone,
          password: senha,
          bio: "",
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert("Cadastro realizado com sucesso!");
        navigate("/");
      } else {
        setErro(dados.message || "Erro ao cadastrar. Verifique os dados.");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor.");
    }
  };

  const extrairInfoRG = async () => {
    if (!imagemFrente || !imagemVerso) {
      setErro("Envie as imagens da frente e verso do RG.");
      return;
    }

    const formData = new FormData();
    formData.append("frente", imagemFrente);
    formData.append("verso", imagemVerso);

    try {
      console.log("Enviando para IA...");
      const resposta = await fetch("http://localhost:8000/processar-documento", {
        method: "POST",
        body: formData,
      });

      if (!resposta.ok) throw new Error("Erro ao processar o documento.");

      const dados = await resposta.json();

      setNome(dados.nome || "");
      setCpf(dados.cpf || "");
      // Se quiser usar a data de nascimento:
      // console.log("Data de nascimento:", dados.data_nascimento);

    } catch (err) {
      console.error("Erro ao se comunicar com a IA:", err);
      setErro("Erro ao se comunicar com a IA.");
    }
  };

  return (
    <div
      className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fundo.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

      <div className="flex items-center justify-center z-10 p-6">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaUserPlus /> Cadastro
          </h2>
          {erro && <p className="text-red-500 text-sm mb-2">{erro}</p>}
          <form onSubmit={handleCadastro} className="space-y-4">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full border p-2 rounded"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="CPF"
              className="w-full border p-2 rounded"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Telefone"
              className="w-full border p-2 rounded"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full border p-2 rounded"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <div className="text-sm mt-2">
              <label className="block mb-1 font-medium">RG (frente e verso)</label>
              <input type="file" accept="image/*" onChange={(e) => setImagemFrente(e.target.files[0])} />
              <input type="file" accept="image/*" onChange={(e) => setImagemVerso(e.target.files[0])} className="mt-2" />
              <button
                type="button"
                onClick={extrairInfoRG}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Preencher com foto
              </button>
            </div>

            <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Cadastrar
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Já tem uma conta?{" "}
            <Link to="/" className="text-green-600 underline">
              Logar
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-center items-center text-white z-10 p-10">
        <FaUserPlus className="text-6xl mb-4" />
        <h1 className="text-4xl font-bold mb-4">Crie sua conta</h1>
        <p className="text-lg text-center">
          Comece agora a anunciar ou encontrar imóveis com o ImobLink.
        </p>
      </div>
    </div>
  );  
}

export default Cadastro;
