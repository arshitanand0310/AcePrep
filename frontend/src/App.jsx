import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
   PRIVATE ROUTE
*/
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

/* 
 PUBLIC ROUTE
*/
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
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