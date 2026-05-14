import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { formatarTelefone, limparMascara } from "../utils/formatters";

function EditarPerfil() {
  const [dadosUsuario, setDadosUsuario] = useState({});
  const [fotoPerfil, setFotoPerfil] = useState("/imagemperfil.jpg");
  const [novaBio, setNovaBio] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novaImagem, setNovaImagem] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    // Carrega dados do usuário
    fetch("http://localhost:8080/api/user/account", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar dados");


const resposta = await res.json();
const data = resposta.data || resposta;

setDadosUsuario(data);
setNovaBio(data.bio || "");
setNovoNome(data.name || "");
setNovoTelefone(formatarTelefone(data.phoneNumber || ""));

// Busca imagem se existir
if (data.imageProfileId) {
  fetch(`http://localhost:8080/api/images/get/${data.imageProfileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Erro ao carregar imagem");

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const respostaImg = await res.json();
        if (respostaImg.data) {
          setFotoPerfil(`data:image/jpeg;base64,${respostaImg.data}`);
        } else {
          setFotoPerfil("/imagemperfil.jpg");
        }
      } else {
        const blob = await res.blob();
        setFotoPerfil(URL.createObjectURL(blob));
      }
    })
    .catch(() => setFotoPerfil("/imagemperfil.jpg"));
}


        
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  // Atualizar informações (nome, telefone, bio)
  const salvarInfo = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/user/setInfo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: novoNome,
          phoneNumber: limparMascara(novoTelefone),
          bio: novaBio,
        }),
      });

      if (res.ok) {
        alert("Informações atualizadas com sucesso!");
      } else {
        alert("Erro ao atualizar informações!");
      }
    } catch (error) {
      console.error("Erro ao salvar informações:", error);
      alert("Falha de conexão com o servidor.");
    }
  };

  // Atualizar imagem de perfil
  const salvarImagem = async () => {
    const token = localStorage.getItem("token");
    if (!novaImagem) return alert("Selecione uma imagem primeiro!");

    const formData = new FormData();
    formData.append("image", novaImagem);

    try {
      const res = await fetch("http://localhost:8080/api/user/setImageProfile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("Imagem de perfil atualizada!");
        window.location.reload();
      } else {
        alert("Erro ao atualizar imagem!");
      }
    } catch (error) {
      console.error("Erro ao salvar imagem:", error);
      alert("Falha ao enviar imagem.");
    }
  };

  // Alterar senha
  const salvarSenha = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/user/setPassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: senhaAtual,
          newPassword: novaSenha,
        }),
      });

      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setSenhaAtual("");
        setNovaSenha("");
      } else {
        alert("Erro ao alterar senha!");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Falha de conexão com o servidor.");
    }
  };

  // Excluir conta
  const deletarConta = async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta?")) return;
    const token = localStorage.getItem("token");
    if (!senhaAtual) return alert("Digite sua senha atual para confirmar.");

    try {
      const res = await fetch("http://localhost:8080/api/user/deleteProfile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: senhaAtual }),
      });

      if (res.ok) {
        alert("Conta excluída com sucesso.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Erro ao excluir conta.");
      }
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-100 p-6 mt-8 flex justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>

          {/* Imagem */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-lg border-2 border-gray-300 object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNovaImagem(e.target.files[0])}
              className="text-sm"
            />
            <button
              onClick={salvarImagem}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Atualizar Imagem
            </button>
          </div>

          {/* Informações */}
          <div className="space-y-3">
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nome"
              className="w-full border rounded p-2"
            />
            <input
              type="text"
              value={novoTelefone}
              onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
              placeholder="Telefone"
              maxLength={15}
              className="w-full border rounded p-2"
            />
            <textarea
              value={novaBio}
              onChange={(e) => setNovaBio(e.target.value)}
              placeholder="Bio"
              rows={3}
              className="w-full border rounded p-2"
            />
            <button
              onClick={salvarInfo}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Salvar Informações
            </button>
          </div>

          {/* Alterar senha */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-gray-700">Alterar Senha</h3>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Senha atual"
              className="w-full border rounded p-2"
            />
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Nova senha"
              className="w-full border rounded p-2"
            />
            <button
              onClick={salvarSenha}
              className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
            >
              Atualizar Senha
            </button>
          </div>

{/* Excluir conta */}
<div className="space-y-3 border-t pt-4">
  <h3 className="font-semibold text-gray-700">Excluir Conta</h3>
  <p className="text-sm text-gray-600">
    Para excluir sua conta, será necessário confirmar sua senha.
  </p>

  <button
    onClick={async () => {
      if (!confirm("Tem certeza que deseja excluir sua conta?")) return;

      const senha = prompt("Digite sua senha atual para confirmar:");
      if (!senha) {
        alert("Exclusão cancelada: senha não informada.");
        return;
      }

      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:8080/api/user/deleteProfile", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: senha }),
        });

        if (res.ok) {
          alert("Conta excluída com sucesso.");
          localStorage.removeItem("token");
          navigate("/");
        } else {
          alert("Erro ao excluir a conta.");
        }
      } catch (err) {
        console.error("Erro ao excluir conta:", err);
        alert("Erro ao conectar com o servidor.");
      }
    }}
    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
  >
    Excluir Conta
  </button>
</div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditarPerfil;
