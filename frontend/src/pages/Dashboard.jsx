import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API, { setManualLogout } from "../services/api";
import ScrollToTopButton from "./ScrollToTopButton";



const faqs = [
  {
    q: "Is AcePrep suitable for beginners?",
    a: "Absolutely. AcePrep adjusts question difficulty based on your topic and experience level.",
  },
  {
    q: "How does the AI scoring work?",
    a: "AI analyzes clarity, depth, relevance, and communication to generate feedback.",
  },
  {
    q: "Can I practice for specific job roles?",
    a: "Yes! Upload your resume or choose topics manually.",
  },
  {
    q: "Are my interviews saved automatically?",
    a: "Yes, every interview session is saved to your history.",
  },
  {
    q: "Which AI model powers AcePrep?",
    a: "AcePrep uses Groq API for ultra-fast responses.",
  },
  {
    q: "Is my resume secure?",
    a: "Yes. Your data is encrypted and never shared.",
  },
  {
    q: "Does AcePrep simulate real interviews?",
    a: "Yes. Questions mirror real-world company interviews.",
  },
  {
    q: "Can I track improvement?",
    a: "Yes. Performance history helps you improve over time.",
  },
  {
    q: "What makes AcePrep different?",
    a: "Dynamic AI interviews instead of static question banks.",
  },
];



function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button
        className="faq-q"
        onClick={() => setOpen(!open)}
      >
        {q}
        <span className="faq-chevron material-symbols-outlined">
          expand_more
        </span>
      </button>

      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}



export default function Dashboard() {
  const navigate = useNavigate();

  
  const handleLogout = async () => {
    try {
      
      await API.post("/auth/logout");

      
      setManualLogout();

      
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="db-root">

      
      <header className="db-header">
        <div className="db-logo">AcePrep</div>
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      
      <div className="db-hero">
        <h1>Your Interview Command Center</h1>
        <p>
          Practice smarter, learn faster,
          and walk into every interview confidently.
        </p>
      </div>

      
      <div className="db-section">
        <div className="db-section-title">
          Quick <span>Actions</span>
        </div>

        <div className="db-grid-3">

          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">
              upload_file
            </span>
            <h2>Resume Upload Interview</h2>
            <p>Personalized interview from resume.</p>
            <button
              className="db-btn-primary"
              onClick={() => navigate("/resume-upload")}
            >
              Upload Resume
            </button>
          </div>

          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">
              play_circle
            </span>
            <h2>Start Topic Interview</h2>
            <p>Practice real-world interview questions.</p>
            <button
              className="db-btn-primary"
              onClick={() => navigate("/start-interview")}
            >
              Start Interview
            </button>
          </div>

          <div className="db-card">
            <span className="material-symbols-outlined db-card-icon">
              history
            </span>
            <h2>Past Interviews</h2>
            <p>Track progress and review sessions.</p>
            <button
              className="db-btn-primary"
              onClick={() => navigate("/history")}
            >
              View Interviews
            </button>
          </div>

        </div>
      </div>

      <div className="db-divider" />

      
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

      <div className="db-divider" />

      
      <div className="db-section">
        <div className="db-section-title center">
          Contact <span>Us</span>
        </div>

        <div className="contact-box">
          <h3>Have questions?</h3>

          <a
            className="contact-mail"
            href="mailto:aceprepx@gmail.com"
          >
            aceprepx@gmail.com
          </a>
        </div>
      </div>

     
      <footer>
        <div className="f-logo">AcePrep</div>
        <p>
          © {new Date().getFullYear()} AcePrep
        </p>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
