import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LiveInterview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const loadInterview = async () => {
      try {
        const { data } = await api.get(`/interviews/result/${id}`);

        
        if (data.completed) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
        navigate("/dashboard", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id, navigate]);

  
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    try {
      const { data } = await api.post("/interviews/answer", {
        interviewId: id,
        questionIndex: current,
        answer
      });

      
      if (data.completed) {
        navigate(`/result/${id}`, { replace: true });
        return;
      }

      setCurrent(prev => prev + 1);
      setAnswer("");

    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
  };

 
  if (loading) return <h2 className="live-loading">Preparing your interview...</h2>;
  if (!questions.length) return <h2 className="live-loading">Interview unavailable</h2>;

  
  return (
    <div className="live-container">
      <h2>
        Question {current + 1} / {questions.length}
      </h2>

      <div className="live-question">
        {questions[current]}
      </div>

      <textarea
        rows="6"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        className="live-textarea"
      />

      <button
        onClick={submitAnswer}
        className="live-btn"
      >
        Next
      </button>
    </div>
  );
}