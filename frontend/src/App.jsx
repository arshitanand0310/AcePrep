import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StartInterview from "./pages/StartInterview";
import LiveInterview from "./pages/LiveInterview";
import InterviewResult from "./pages/InterviewResult";
import History from "./pages/History";
import ResumeUpload from "./pages/ResumeUpload";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/*
   AUTH LISTENER
*/
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("auth-logout", logout);
    return () => window.removeEventListener("auth-logout", logout);
  }, [navigate]);

  return null;
}

/*
   PRIVATE ROUTE (Cookie Based)
*/
function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null;

  return authenticated ? children : <Navigate to="/login" replace />;
}

/*
   PUBLIC ROUTE (Cookie Based)
*/
function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null;

  return authenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthListener />

      <Routes>

        
        <Route path="/" element={<Landing />} />

        
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

       
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/start-interview" element={<PrivateRoute><StartInterview /></PrivateRoute>} />
        <Route path="/resume-upload" element={<PrivateRoute><ResumeUpload /></PrivateRoute>} />
        <Route path="/interview/:id" element={<PrivateRoute><LiveInterview /></PrivateRoute>} />
        <Route path="/result/:id" element={<PrivateRoute><InterviewResult /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />

        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

       
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
