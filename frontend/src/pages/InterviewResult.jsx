import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";
import ScrollToTopButton from "./ScrollToTopButton"; 

export default function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
   
    window.history.replaceState(null, "", "/result/" + id);

    const forceDashboard = () => {
      window.location.replace("/dashboard");
    };

    
    window.addEventListener("popstate", forceDashboard);

    
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) forceDashboard();
    });

    return () => {
      window.removeEventListener("popstate", forceDashboard);
    };
  }, [id]);

  
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await api.get(`/interviews/result/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("REPORT LOAD ERROR:", err.response?.data || err.message);
        alert("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <h2 className="report-loading">Generating Report...</h2>;
  if (!data) return <h2 className="report-loading">No report found</h2>;

  return (
    <div className="report-container">
      <h1>Interview Report</h1>

      <p><b>Difficulty:</b> {data.difficulty}</p>

      {(data.answers || []).map((a, i) => (
        <div key={i} className="report-card">
          <h3>Q{i + 1}. {a.question}</h3>
          <p><b>Your Answer:</b> {a.userAnswer}</p>
          <p><b>Score:</b> {a.score}/10</p>
          <p><b>Feedback:</b> {a.aiFeedback}</p>
          {a.idealAnswer && <p><b>Ideal Answer:</b> {a.idealAnswer}</p>}
        </div>
      ))}

      <div className="report-buttons">
        <button className="report-btn" onClick={() => window.location.replace("/dashboard")}>
          Go to Dashboard
        </button>

        <button className="report-btn" onClick={() => window.location.replace("/resume-upload")}>
          Upload Resume
        </button>

        <button className="report-btn" onClick={() => window.location.replace("/history")}>
          Past Interviews
        </button>
      </div>

      
      <footer>
        <div className="f-logo">AcePrep</div>
        <p>© {new Date().getFullYear()} AcePrep. All rights reserved.</p>
        <div className="f-tag">
          <span className="material-symbols-outlined" style={{ fontSize: '0.78rem', marginRight: '4px' }}>bolt</span>
          Powered by Groq AI
        </div>
      </footer>

     
      <ScrollToTopButton />
    </div>
  );
}