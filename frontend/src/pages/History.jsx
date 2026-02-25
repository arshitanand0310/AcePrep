import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ScrollToTopButton from "./ScrollToTopButton"; 

export default function History() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  
  const load = async () => {
    try {
      const res = await api.get("/interviews");
      setInterviews(res.data);
    } catch (err) {
      console.error("HISTORY LOAD ERROR:", err.response?.data || err.message);
      setError("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  
  const deleteInterview = async (id) => {
    try {
      await api.delete(`/interviews/${id}`);

      setInterviews(prev => prev.filter(i => i._id !== id));
      setMessage("Interview deleted successfully.");
      setError("");
      setConfirmDeleteId(null);

      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      setError(err?.response?.data?.message || "Delete failed");
      setMessage("");
    }
  };

  
  const openReport = (id) => {
    navigate(`/result/${id}`);
  };

  if (loading) return <h2 className="loading-text">Loading interviews...</h2>;

  return (
    <div className="history-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      
      <div style={{ flex: 1 }}>
        <h1>Past Interviews</h1>

        {message && (
          <div className="page-message success">{message}</div>
        )}

        {error && (
          <div className="page-message error">{error}</div>
        )}

        {interviews.length === 0 && <p>No interviews yet</p>}

        {interviews.map((i) => (
          <div key={i._id} className="history-card">
            <h3>Role: {i.role || i.topic || "General Interview"}</h3>
            <p>Difficulty: {i.difficulty}</p>
            <p>Date: {new Date(i.createdAt).toLocaleString()}</p>

            <div className="history-btns">
              <button
                className="view-btn"
                onClick={() => openReport(i._id)}
              >
                View Report
              </button>

              {confirmDeleteId === i._id ? (
                <div className="delete-confirm">
                  <p>Are you sure?</p>
                  <button onClick={() => deleteInterview(i._id)}>Yes</button>
                  <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </div>
              ) : (
                <button
                  className="delete-btn"
                  onClick={() => setConfirmDeleteId(i._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="bottom-dashboard">
          <button
            className="dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
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