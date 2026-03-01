import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { clearManualLogout } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);



  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      
      clearManualLogout();

      setSuccess(
        "Account created successfully! Redirecting..."
      );

      
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1200);

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
        "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="auth-container">
      <h1>Create Account</h1>

      <form onSubmit={handleRegister} className="auth-form">

        <input
          className="auth-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
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
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="auth-btn"
          disabled={loading}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        {error && (
          <p className="auth-error">{error}</p>
        )}

        {success && (
          <p className="success-msg">{success}</p>
        )}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </form>
    </div>
  );
}
