import { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Issues from "./pages/Issues.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import IssueDetails from "./pages/IssueDetails.jsx";
import MyIssues from "./pages/MyIssues.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CinematicEntryScene from "./components/CinematicEntryScene.jsx";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // Play movie-like intro on first visit of this browser session
    try {
      return !sessionStorage.getItem("civic_intro_seen");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handleTriggerIntro() {
      setShowIntro(true);
    }

    window.addEventListener("play-cinematic-intro", handleTriggerIntro);
    return () => window.removeEventListener("play-cinematic-intro", handleTriggerIntro);
  }, []);

  function handleIntroComplete() {
    try {
      sessionStorage.setItem("civic_intro_seen", "true");
    } catch {}
    setShowIntro(false);
  }

  return (
    <>
      {showIntro && (
        <CinematicEntryScene onComplete={handleIntroComplete} autoPlay={true} />
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="/my-issues" element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={["officer", "admin"]}><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}
