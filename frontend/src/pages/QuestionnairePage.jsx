import Questionnaire from "../components/Questionnaire";
import { useNavigate } from "react-router-dom";

function QuestionnairePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  async function handleSubmit(data) {
    try {
      await fetch("http://localhost:8080/api/posts/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      navigate("/home");;
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSkip() {
    try {
      await fetch("http://localhost:8080/api/posts/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: null,
          propertyType: null,
          priceRange: null,
        }),
      });

      navigate("/home");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Questionnaire
        onSubmit={handleSubmit}
        onSkip={handleSkip}
      />
    </div>
  );
}

export default QuestionnairePage;