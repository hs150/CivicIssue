import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogIn, LogOut, Menu, ShieldCheck, X, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeSelector from "./ThemeSelector.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    navigate("/");
    close();
  }

  // Reactive scroll effect
  useState(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-emerald-50 text-emerald-800 shadow-xs"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* 3. NAVBAR (Taller, scroll-reactive with blur 18px and translucent background) */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2.5 bg-white/78 backdrop-blur-[18px] border-b border-slate-200/80 shadow-sm shadow-slate-950/5"
            : "py-4 bg-white/90 backdrop-blur-md border-b border-slate-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Operational Chip */}
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
                <span className="text-lg leading-tight font-extrabold tracking-tight">Civic<span className="text-emerald-700">Connect</span></span>
                <span className="text-[10px] font-mono tracking-wider text-emerald-600 uppercase flex items-center gap-1 font-bold">
                  <Sparkles size={10} /> CIVIC INTELLIGENCE OS
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

            {/* Theme Selector */}
            <div className="my-1 md:my-0">
              <ThemeSelector />
            </div>

            {/* Separator on desktop */}
            <div className="hidden md:block h-6 w-px bg-slate-200 mx-2" />

            {/* Report CTA */}
            <Link
              to="/report"
              onClick={close}
              className="group my-2 md:my-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Report Issue</span>
              <span className="hidden sm:inline transition-transform group-hover:translate-x-0.5">→</span>
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
                  className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition ml-1 cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <LogIn size={15} /> Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* 14. MODERN DARK FOOTER */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Brand & Manifesto Column */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 font-black text-white">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base shadow-md shadow-emerald-500/20">
                  C
                </div>
                <span className="text-xl font-extrabold tracking-tight">Civic<span className="text-emerald-400">Connect</span></span>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-light">
                Building more transparent, responsive, and accountable cities through multimodal vision intelligence, geospatial deduplication, and community verification.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>MUNICIPAL CONSENSUS NETWORK • 100% AUDITABLE</span>
              </div>
            </div>

            {/* Column: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/issues" className="hover:text-white transition">Explore Issues</Link></li>
                <li><Link to="/report" className="hover:text-white transition">Report an Issue</Link></li>
                <li><Link to="/my-issues" className="hover:text-white transition">Citizen Tracking</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Officer Command Desk</Link></li>
              </ul>
            </div>

            {/* Column: Architecture */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">Technology</h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-400">Gemini Vision AI</li>
                <li className="text-slate-400">500m Haversine Clustering</li>
                <li className="text-slate-400">Before / After Neural Audit</li>
                <li className="text-slate-400">PostgreSQL Spatial Database</li>
              </ul>
            </div>

            {/* Column: Governance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">Governance</h4>
              <ul className="space-y-2 text-xs">
                <li className="text-slate-400">Open Public Ledger</li>
                <li className="text-slate-400">Anti-Corruption Protocol</li>
                <li className="text-slate-400">Citizen Privacy Shield</li>
                <li className="text-slate-400">Municipal SLA Guarantees</li>
              </ul>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>© {new Date().getFullYear()} CivicConnect Platform. All municipal rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <span>SECURITY: ISO-27001 ENCLAVE</span>
              <span className="hidden sm:inline">•</span>
              <span>IN EMERGENCY CALL 112 DIRECTLY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

