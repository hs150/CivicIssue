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

export default function App() {
  return (
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
  );
}
