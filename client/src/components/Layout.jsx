import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, Menu, ShieldCheck, X, Plus, Sparkles, Activity, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeSelector from "./ThemeSelector.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    navigate("/");
    close();
  }

  // Smooth scroll handler for anchor links
  const handleAnchorClick = (e, targetId) => {
    close();
    if (location.pathname !== "/") {
      navigate("/" + targetId);
      return;
    }
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-[#07111F]">
      {/* =========================================================
          STICKY PREMIUM NAVBAR
          Translucent white background, backdrop blur, subtle border #DDE5E1
      ========================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 bg-white/80 backdrop-blur-md border-b border-[#DDE5E1] shadow-xs"
            : "py-4 bg-[#F7F9F8]/90 backdrop-blur-sm border-b border-[#DDE5E1]/80"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-black text-[#07111F] group"
            onClick={close}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C896] text-[#020817] font-black text-lg shadow-sm transition-transform group-hover:scale-105">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-[#07111F]">
                Civic<span className="text-[#00C896]">Connect</span>
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-wider text-[#64748B] uppercase mt-0.5">
                CIVIC INTELLIGENCE OS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav
            className={`${
              open
                ? "absolute left-0 right-0 top-full flex flex-col border-b border-[#DDE5E1] bg-white p-5 shadow-xl md:hidden"
                : "hidden"
            } md:flex md:items-center md:gap-1 text-sm font-medium text-[#64748B]`}
          >
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="rounded-lg px-3 py-1.5 transition hover:text-[#07111F] hover:bg-slate-100"
            >
              How it works
            </a>
            <a
              href="#live-pulse"
              onClick={(e) => handleAnchorClick(e, "#live-pulse")}
              className="rounded-lg px-3 py-1.5 transition hover:text-[#07111F] hover:bg-slate-100"
            >
              Live Pulse
            </a>
            <a
              href="#ai-verification"
              onClick={(e) => handleAnchorClick(e, "#ai-verification")}
              className="rounded-lg px-3 py-1.5 transition hover:text-[#07111F] hover:bg-slate-100"
            >
              AI Verification
            </a>
            <NavLink
              to="/issues"
              onClick={close}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition ${
                  isActive
                    ? "font-bold text-[#07111F] bg-slate-100"
                    : "hover:text-[#07111F] hover:bg-slate-100"
                }`
              }
            >
              Issues
            </NavLink>

            {user && (
              <NavLink
                to="/my-issues"
                onClick={close}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition ${
                    isActive
                      ? "font-bold text-[#07111F] bg-slate-100"
                      : "hover:text-[#07111F] hover:bg-slate-100"
                  }`
                }
              >
                My Issues
              </NavLink>
            )}

            {user && user.role !== "citizen" && (
              <NavLink
                to="/dashboard"
                onClick={close}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition ml-1"
              >
                <ShieldCheck size={14} /> Officer Desk
              </NavLink>
            )}

            {/* Mobile-only session actions */}
            <div className="pt-4 border-t border-[#DDE5E1] mt-3 flex flex-col gap-2 md:hidden">
              <Link
                to="/report"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00C896] px-4 py-2.5 text-sm font-bold text-[#020817]"
              >
                <Plus size={16} /> Report Issue
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700"
                >
                  <LogOut size={16} /> Log Out ({user.name || user.email})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700"
                >
                  <LogIn size={16} /> Login
                </Link>
              )}
            </div>
          </nav>

          {/* Right Side: Theme switcher + Report Issue button + Auth */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <ThemeSelector />
            </div>

            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00C896] hover:bg-[#008F70] px-4 py-2 text-sm font-bold text-[#020817] hover:text-white transition shadow-sm active:scale-95"
            >
              <Plus size={16} />
              <span>Report Issue</span>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2 pl-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300"
                  title={user.email}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-[#64748B] hover:text-rose-600 transition"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-1 rounded-xl border border-[#DDE5E1] bg-white px-3.5 py-2 text-sm font-semibold text-[#07111F] hover:bg-slate-50 transition shadow-2xs"
              >
                <LogIn size={15} />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* =========================================================
          COMPACT & PROFESSIONAL DARK FOOTER
          Dark navy #020817 with subtle borders and government-grade trust
      ========================================================= */}
      <footer className="border-t border-slate-800 bg-[#020817] text-[#64748B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & GovTech Mission */}
            <div className="md:col-span-2 space-y-3">
              <Link to="/" className="flex items-center gap-2 font-black text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00C896] text-[#020817] font-black text-sm">
                  C
                </div>
                <span className="text-base font-extrabold tracking-tight">
                  Civic<span className="text-[#00C896]">Connect</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                An enterprise civic intelligence platform connecting citizens, automated vision inspection, and municipal field units for verified physical infrastructure repairs.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[#00C896]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
                <span>MUNICIPAL PUBLIC LEDGER • 100% AUDITABLE</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Platform
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/issues" className="hover:text-white transition">Explore Issues</Link></li>
                <li><Link to="/report" className="hover:text-white transition">Report an Issue</Link></li>
                <li><Link to="/my-issues" className="hover:text-white transition">Citizen Tracking</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Officer Desk</Link></li>
              </ul>
            </div>

            {/* Column 3: Trust & Security */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Integrity
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Multimodal Vision Models</li>
                <li>500m Geo-Deduplication</li>
                <li>Anti-Corruption Image Trails</li>
                <li>Citizen Community Sign-Off</li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
            <p>© {new Date().getFullYear()} CivicConnect Platform. All municipal rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>SECURITY: ISO-27001 ENCLAVE</span>
              <span>•</span>
              <span>IN EMERGENCY CALL 112 DIRECTLY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
