import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, TOKEN_KEY } from "../config/constants";

function RotaProtegida({ children }) {
  const [autenticado, setAutenticado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/");
      return;
    }

    fetch("${API_URL}/user/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setAutenticado(true);
        } else {
          throw new Error("Token inválido");
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/");
      });
  }, []);

  if (autenticado === null) {
    return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

  return children;
}

export default RotaProtegida;
