import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogIn, LogOut, Menu, ShieldCheck, X, Plus, Sparkles, Play } from "lucide-react";
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

  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-emerald-50 text-emerald-800 shadow-xs"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-shadow duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo & Hackathon Chip */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 font-black tracking-tight text-slate-900" onClick={close}>
              <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-lg font-black text-white shadow-md shadow-emerald-700/25">
                C
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg leading-tight">Civic<span className="text-emerald-700">Connect</span></span>
                <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase flex items-center gap-1">
                  <Sparkles size={10} /> AI City OS
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop & Mobile Navigation Links */}
          <nav
            className={`${
              open ? "absolute left-0 right-0 top-full flex flex-col border-b border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-lg" : "hidden"
            } md:static md:flex md:flex-row md:items-center md:gap-1.5 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <NavLink to="/" onClick={close} className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/issues" onClick={close} className={navLinkClass}>
              Explore Issues
            </NavLink>

            {user && (
              <NavLink to="/my-issues" onClick={close} className={navLinkClass}>
                My Issues
              </NavLink>
            )}

            {user && user.role !== "citizen" && (
              <NavLink
                to="/dashboard"
                onClick={close}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-indigo-600 hover:bg-indigo-50/70"
                  }`
                }
              >
                <ShieldCheck size={16} /> Officer Desk
              </NavLink>
            )}

            {/* Intro Video button */}
            <button
              type="button"
              onClick={() => {
                close();
                window.dispatchEvent(new CustomEvent("play-cinematic-intro"));
              }}
              title="Play 4K Cinematic Animation Video"
              className="my-1 md:my-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500/60 transition cursor-pointer shadow-xs"
            >
              <Play size={13} className="fill-current text-emerald-600" />
              <span>Intro Video</span>
            </button>

            {/* Separator on desktop */}
            <div className="hidden md:block h-6 w-px bg-slate-200 mx-1" />

            {/* Report CTA */}
            <Link
              to="/report"
              onClick={close}
              className="my-2 md:my-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95"
            >
              <Plus size={16} /> Report Issue
            </Link>

            {/* User Session Info / Role Badge */}
            {user ? (
              <div className="flex items-center gap-2 pt-2 md:pt-0 md:ml-2 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs grid place-items-center uppercase border border-slate-300">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[110px] leading-tight">
                      {user.name || user.email}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full w-fit ${
                        user.role === "officer" || user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role === "officer" || user.role === "admin" ? "🛡️ Officer" : "👤 Citizen"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition ml-1"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <LogIn size={15} /> Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>© {new Date().getFullYear()} CivicConnect • AI-Driven Civic Response Platform</span>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Bell size={13} /> Official Prototype. In emergency situations, call 112 directly.
          </p>
        </div>
      </footer>
    </div>
  );
}
