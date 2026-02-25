import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StartInterview() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startInterview = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/interviews/topic", {
        topic,
        difficulty
      });

      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview");
    }
    setLoading(false);
  };

  return (
    <div className="topic-container">
      <h1>Start Topic Interview</h1>

      <div className="topic-field">
        <label>Enter Topic</label>
        <input
          type="text"
          placeholder="e.g. Operating System, React, DBMS"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="topic-input"
        />
      </div>

      <div className="topic-field">
        <label>Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="topic-input"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <button className="topic-btn" onClick={startInterview}>
        {loading ? "Starting..." : "Start Interview"}
      </button>
    </div>
  );
}
