import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../services/api";

export default function Landing() {
  const navigate = useNavigate();

 

  useEffect(() => {
    const checkAuth = async () => {
      try {

        
        
        const loggedOut =
          sessionStorage.getItem("manualLogout");

        if (loggedOut) {
          console.log("Manual logout detected");
          return;
        }

        
        await API.get("/auth/me");

        navigate("/dashboard", {
          replace: true,
        });

      } catch {
        console.log("User not authenticated");
      }
    };

    checkAuth();
  }, [navigate]);

 

  return (
    <div className="lp-root">

      
      <nav className="lp-nav">
        <div className="lp-logo">AcePrep</div>

        <div className="nav-actions">
          <button
            className="nav-signin"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>

          <button
            className="nav-cta"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </nav>

      
      <section className="lp-hero">
        <div className="hero-glow" />

        <div className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Interview Practice
        </div>

        <h1>
          Your Interview{" "}
          <span className="hero-highlight">
            Command Center
          </span>
        </h1>

        <p className="hero-sub">
          Practice smarter, learn faster, and walk
          into every interview with confidence.
        </p>

        <div className="hero-btns">
          <button
            className="btn-primary"
            onClick={() => navigate("/register")}
          >
            Create Free Account
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </section>

      
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">5k+</div>
          <div className="stat-label">
            Interviews Completed
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-num">95%</div>
          <div className="stat-label">
            Satisfaction Rate
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-num">500+</div>
          <div className="stat-label">
            Topics Covered
          </div>
        </div>
      </div>

      
      <section className="lp-section">
        <h2 className="section-title">
          Quick <span className="title-accent">Actions</span>
        </h2>

        <div className="cards-grid-single">
          <div className="action-card">
            <div className="card-icon">
              <span className="material-symbols-outlined">
                play_circle
              </span>
            </div>

            <h3>Start Topic Interview</h3>

            <p>
              Choose any subject and practice
              real-world interview questions.
            </p>

            <button
              className="card-btn"
              onClick={() => navigate("/register")}
            >
              Start Interview
            </button>
          </div>
        </div>
      </section>

      
      <section className="lp-how">
        <h2 className="section-title">
          How It <span className="title-accent">Works</span>
        </h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Create Your Account</h3>
            <p>Sign up free in seconds.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Choose Your Path</h3>
            <p>Select topic or upload resume.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Get Instant Feedback</h3>
            <p>Receive hiring verdicts instantly.</p>
          </div>
        </div>
      </section>

      
      <div className="lp-cta">
        <div className="cta-glow" />

        <h2>Ready to Ace Your Next Interview?</h2>

        <div className="hero-btns">
          <button
            className="btn-primary"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </div>

      
      <footer className="lp-footer">
        <div>
          AcePrep © {new Date().getFullYear()}
        </div>
        <div>
          Built with Love for developers
        </div>
      </footer>

    </div>
  );
}
