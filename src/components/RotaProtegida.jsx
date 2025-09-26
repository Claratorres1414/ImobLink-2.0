import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RotaProtegida({ children }) {
  const [autenticado, setAutenticado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:8080/api/user/account", {
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
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  if (autenticado === null) {
    return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

  return children;
}

export default RotaProtegida;
