import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter email and password");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      window.location.replace("/dashboard");

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>AcePrep Login</h1>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </form>

      {/* NEW */}
      <p className="auth-link">
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>

      <p className="auth-link">
        New user? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
