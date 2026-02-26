import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import api from "../services/api"; 

const faqs = [
  {
    q: "Is AcePrep suitable for beginners?",
    a: "Absolutely. AcePrep adjusts question difficulty based on your topic and experience level. Whether you're just starting out or have years of experience, you'll get relevant, tailored questions.",
  },
  {
    q: "How does the AI scoring work?",
    a: "After each interview, our AI analyzes your responses for clarity, depth, relevance, and communication. You receive a detailed score with specific feedback on what you did well and what to improve.",
  },
  {
    q: "Can I practice for specific job roles?",
    a: "Yes! You can either upload your resume for a personalized interview or manually choose a topic like Data Structures, System Design, Product Management, HR, and more.",
  },
  {
    q: "Are my interviews saved automatically?",
    a: "Yes, every interview session is saved to your history. You can revisit them anytime, review your answers, see model answers, and track your improvement over time.",
  },
  {
    q: "Which AI model powers AcePrep?",
    a: "AcePrep uses the Groq API for ultra fast, real time AI responses making your interviews feel natural and fluid, just like talking to a real interviewer.",
  },
  {
    q: "Is my resume and interview data secure?",
    a: "Yes. Your resume and interview responses are securely stored and never shared with third parties.",
  },
  {
    q: "Does AcePrep simulate real company interviews?",
    a: "Yes. AcePrep mirrors real world interview scenarios focusing on reasoning and problem solving.",
  },
  {
    q: "Can I track my improvement over time?",
    a: "Absolutely. Your past interviews are saved with detailed scores and feedback.",
  },
  {
    q: "What makes AcePrep different from other platforms?",
    a: "AcePrep generates dynamic, personalized interviews powered by AI.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        {q}
        <span className="faq-chevron material-symbols-outlined">
          expand_more
        </span>
      </button>
      <div className="faq-a">{a}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); 
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="db-root">

      
      <header className="db-header">
        <div className="db-logo">AcePrep</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

     
      <div className="db-hero">
        <h1>Your Interview Command Center</h1>
        <p>Practice smarter, learn faster, and walk into every interview with confidence.</p>
      </div>

      
      <div className="db-section">
        <div className="db-section-title">
          Quick <span>Actions</span>
        </div>

        <div className="db-grid-3">
          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">upload_file</span>
            <h2>Resume Upload Interview</h2>
            <p>Get a personalized interview tailored to your resume and experience.</p>
            <button className="db-btn-primary" onClick={() => navigate("/resume-upload")}>
              Upload Resume
            </button>
          </div>

          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">play_circle</span>
            <h2>Start Topic Interview</h2>
            <p>Choose any subject and practice answering real-world interview questions.</p>
            <button className="db-btn-primary" onClick={() => navigate("/start-interview")}>
              Start Interview
            </button>
          </div>

          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">history</span>
            <h2>Past Interviews</h2>
            <p>Review your sessions, analyse your mistakes, and track your growth.</p>
            <button className="db-btn-primary" onClick={() => navigate("/history")}>
              View Interviews
            </button>
          </div>
        </div>
      </div>

     
      <div className="db-section">
        <div className="db-section-title center">
          <span>FAQ</span>
        </div>

        <div className="faq-section">
          <div className="faq-list">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>

      
      <footer>
        <div className="f-logo">AcePrep</div>
        <p>© {new Date().getFullYear()} AcePrep. All rights reserved.</p>
        <div className="f-tag">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "0.78rem", marginRight: "4px" }}
          >
            bolt
          </span>
          Powered by Groq AI
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
