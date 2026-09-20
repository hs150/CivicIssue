import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white animate-spin" />
          <div className="absolute h-10 w-10 rounded-full border border-neutral-400 dark:border-neutral-500 animate-ping" />
          <div className="h-3 w-3 rounded-full bg-black dark:bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </div>
        <div>
          <p className="text-xs font-mono tracking-widest text-neutral-900 dark:text-white uppercase font-bold">
            VERIFYING CIVIC CREDENTIALS
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
            SECURE ENCLAVE HANDSHAKE...
          </p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

