import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="lp-root">

      
      <nav className="lp-nav">
        <div className="lp-logo">AcePrep</div>
        <div className="nav-actions">
          <button className="nav-signin" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="nav-cta" onClick={() => navigate("/register")}>
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
          <span className="hero-highlight">Command Center</span>
        </h1>

        <p className="hero-sub">
          Practice smarter, learn faster, and walk into every interview with confidence
          powered by real time AI.
        </p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Create Free Account
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>

      
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">5k+</div>
          <div className="stat-label">Interviews Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">95%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">500+</div>
          <div className="stat-label">Topics Covered</div>
        </div>
      </div>

      
      <section className="lp-section">
        <h2 className="section-title">
          Quick <span className="title-accent">Actions</span>
        </h2>

        <div className="cards-grid-single">
          <div className="action-card">
            <div className="card-icon">
              <span className="material-symbols-outlined">play_circle</span>
            </div>
            <h3>Start Topic Interview</h3>
            <p>
              Choose any subject and practice answering real-world interview questions.
            </p>
            <button className="card-btn" onClick={() => navigate("/register")}>
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
            <p>Sign up free in seconds. No credit card required.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Choose Your Path</h3>
            <p>
              Upload your resume or pick a topic to drill down on specific skills.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Get Instant Feedback</h3>
            <p>
              Receive hiring verdicts, scores, strengths, and improvement plans.
            </p>
          </div>
        </div>
      </section>

      
      <section className="lp-section">
        <h2 className="section-title">
          Why <span className="title-accent">AcePrep</span>
        </h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <h3>Personalized Interviews</h3>
            <p>Role-specific questions tailored to your exact skillset.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <h3>Real-Time AI</h3>
            <p>Lightning-fast AI that feels like a real interviewer.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">assessment</span>
            </div>
            <h3>Detailed Reports</h3>
            <p>Hiring verdicts, strengths, weaknesses, and improvement insights.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h3>Private & Secure</h3>
            <p>Your resume and data remain encrypted and private.</p>
          </div>
        </div>
      </section>

     
      <div className="lp-cta">
        <div className="cta-glow" />
        <h2>Ready to Ace Your Next Interview?</h2>
        <p>Join thousands of developers practicing smarter with AcePrep.</p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Get Started 
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </div>

      
      <footer className="lp-footer">
        <div>AcePrep © {new Date().getFullYear()}</div>
        <div>Built with Love for ambitious developers</div>
      </footer>

    </div>
  );
}