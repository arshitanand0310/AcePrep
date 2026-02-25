import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {

  const { token: rawToken } = useParams();
  const navigate = useNavigate();

  
  const token = useMemo(() => {
    if (!rawToken) return null;
    try {
      return decodeURIComponent(rawToken).replace(/\s/g, "").trim();
    } catch {
      return rawToken;
    }
  }, [rawToken]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirm;

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!token) return setError("Invalid reset link");

    if (!password || !confirm)
      return setError("Please fill all fields");

    if (!passwordsMatch)
      return setError("Passwords do not match");

    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);

    try {
     
      const res = await api.post(`/auth/reset/${token}`, { password });

      setMsg(res?.data?.message || "Password updated successfully!");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      console.log("RESET ERROR:", err?.response || err);

      if (err?.response?.status === 404)
        setError("Reset link is broken. Please request a new one.");
      else
        setError(err?.response?.data?.message || "Reset link expired. Please request again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>Set New Password</h1>

      <form onSubmit={handleReset} className="auth-form">

        
        <div className="password-field">
          <input
            type={show ? "text" : "password"}
            placeholder="New Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="eye" onClick={() => setShow(!show)}>
            <span className="material-symbols-outlined">
              {show ? "visibility" : "visibility_off"}
            </span>
          </span>
        </div>

       
        <div className="password-field">
          <input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            className="auth-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {confirm && (
          <p className={passwordsMatch ? "success-msg" : "auth-error"}>
            {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
          </p>
        )}

        <button className="auth-btn" disabled={!passwordsMatch || loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        {msg && <p className="success-msg">{msg}</p>}
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}