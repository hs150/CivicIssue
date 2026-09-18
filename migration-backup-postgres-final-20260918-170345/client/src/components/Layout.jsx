import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogIn, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    navigate("/");
    close();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-black tracking-tight text-slate-900" onClick={close}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-lg text-white">C</span>
            <span>Civic<span className="text-emerald-700">Connect</span></span>
          </Link>

          <button className="rounded-xl p-2 md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>

          <nav className={`${open ? "absolute left-0 right-0 top-full flex" : "hidden"} flex-col gap-2 border-b bg-white p-4 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}>
            <NavLink to="/" onClick={close} className="navlink">Home</NavLink>
            <NavLink to="/issues" onClick={close} className="navlink">Explore Issues</NavLink>
            {user && <NavLink to="/my-issues" onClick={close} className="navlink">My Issues</NavLink>}
            {user?.role !== "citizen" && user && <NavLink to="/dashboard" onClick={close} className="navlink flex items-center gap-1"><ShieldCheck size={16}/> Dashboard</NavLink>}
            {user ? (
              <button onClick={handleLogout} className="navlink flex items-center gap-2 text-red-600"><LogOut size={16}/> Logout</button>
            ) : (
              <Link to="/login" onClick={close} className="navlink flex items-center gap-2"><LogIn size={16}/> Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CivicConnect • Hackathon Prototype</p>
          <p className="flex items-center gap-2"><Bell size={14}/> Report responsibly. Never use this for emergencies.</p>
        </div>
      </footer>
    </div>
  );
}
