import { useState } from "react";
import emailjs from "@emailjs/browser";
import api from "../services/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email) return setError("Enter your email");

    setLoading(true);

    try {
     
      const res = await api.post("/auth/forgot-password", { email });

      if (!res.data.resetLink)
        return setError("Reset token not received from server");

      const resetLink = res.data.resetLink;

      
      await emailjs.send(
        "service_ziu26z8",
        "template_gn2cgse",
        {
          to_email: email,
          reset_link: resetLink,
        },
        "MU8AvlHW1ob1NI1DB"
      );

      setMsg("Reset link sent to your email");

    } catch (err) {
      console.log("FORGOT ERROR:", err);
      setError("Failed to send reset email");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>Reset Password</h1>

      <form onSubmit={handleSend} className="auth-form">
        <input
          type="email"
          className="auth-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {msg && <p className="success-msg">{msg}</p>}
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}