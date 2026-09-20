import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, Menu, ShieldCheck, X, Plus, Search, Moon, Sun, Send, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleMode, isDark, activeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/issues?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/issues");
    }
  };

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 15);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-[#07111F] transition-colors duration-300">
      {/* =========================================================
          STICKY NAVBAR (Matches Screenshot)
          White translucent, pill search, theme button, Report Issue +
      ========================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "py-2.5 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs"
            : "py-3.5 bg-white border-b border-[#EAEFEA]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-[#07111F] group"
            onClick={close}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00A881] text-white font-extrabold text-base shadow-xs transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-[#07111F]">
              CivicConnect
            </span>
          </Link>

          {/* Center Navigation Links (Home, How it works, Live Pulse, Issues, About) */}
          <nav
            className={`${
              open
                ? "absolute left-0 right-0 top-full flex flex-col border-b border-[#E2E8F0] bg-white p-5 shadow-xl md:hidden"
                : "hidden"
            } md:flex md:items-center md:gap-1 text-sm font-medium text-[#64748B]`}
          >
            <NavLink
              to="/"
              onClick={close}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 transition ${
                  isActive && location.hash === ""
                    ? "font-bold text-[#00A881] bg-[#00A881]/10"
                    : "hover:text-[#07111F]"
                }`
              }
            >
              Home
            </NavLink>

            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="rounded-full px-3.5 py-1.5 transition hover:text-[#07111F]"
            >
              How it works
            </a>

            <a
              href="#live-pulse"
              onClick={(e) => handleAnchorClick(e, "#live-pulse")}
              className="rounded-full px-3.5 py-1.5 transition hover:text-[#07111F]"
            >
              Live Pulse
            </a>

            <NavLink
              to="/issues"
              onClick={close}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 transition ${
                  isActive
                    ? "font-bold text-[#00A881] bg-[#00A881]/10"
                    : "hover:text-[#07111F]"
                }`
              }
            >
              Issues
            </NavLink>

            <a
              href="#about"
              onClick={(e) => handleAnchorClick(e, "#about")}
              className="rounded-full px-3.5 py-1.5 transition hover:text-[#07111F]"
            >
              About
            </a>

            {user && (
              <NavLink
                to="/my-issues"
                onClick={close}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 transition ${
                    isActive
                      ? "font-bold text-[#00A881] bg-[#00A881]/10"
                      : "hover:text-[#07111F]"
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
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[#00A881] bg-[#00A881]/10 border border-[#00A881]/30 hover:bg-[#00A881]/20 transition ml-1"
              >
                <ShieldCheck size={13} /> Officer Desk
              </NavLink>
            )}
          </nav>

          {/* Right Side: Search Input + Theme Switcher + Report Issue Button */}
          <div className="flex items-center gap-3">
            
            {/* Search Input Bar (Matches screenshot: Search issues...) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <Search size={14} className="absolute left-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues..."
                className="h-9 w-44 xl:w-52 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs text-[#07111F] placeholder-[#94A3B8] focus:border-[#00A881] focus:bg-white focus:outline-none transition"
              />
            </form>

            {/* Theme Toggle Button (Circular icon button) */}
            <button
              type="button"
              onClick={toggleMode}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleTheme();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 text-[#64748B] dark:text-amber-400 hover:text-[#07111F] dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer active:scale-90"
              title={`Switch to ${isDark ? "Light" : "Dark"} mode (Current: ${activeTheme.name}) • Right-click to cycle themes`}
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon size={15} className="text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Report Issue Button (Pill button: Report Issue +) */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#00A881] hover:bg-[#008F70] px-4 py-2 text-xs sm:text-sm font-bold text-white transition shadow-xs active:scale-95"
            >
              <span>Report Issue</span>
              <Plus size={15} strokeWidth={2.5} />
            </Link>

            {/* Auth / Profile controls */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300"
                  title={user.email}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#64748B] hover:text-rose-600 transition font-medium"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[#07111F] px-2 py-1"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
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
          FOOTER (Exact Match to Screenshot)
          Clean light background, 4 columns, subscription box, bottom note
      ========================================================= */}
      <footer className="border-t border-[#EAEFEA] bg-white text-[#64748B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Column 1: Brand, Tagline, Description & Socials (4 Cols) */}
            <div className="md:col-span-4 space-y-3">
              <Link to="/" className="flex items-center gap-2 font-bold text-[#07111F]">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00A881] text-white font-extrabold text-sm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <span className="text-base font-extrabold tracking-tight">CivicConnect</span>
              </Link>
              <p className="text-xs font-semibold text-[#00A881]">
                Cleaner Cities. Stronger Communities.
              </p>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
                A transparent, citizen-driven platform for cleaner, safer and smarter cities.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[#64748B]">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#07111F] transition">
                  <Github size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#07111F] transition">
                  <Linkedin size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#07111F] transition">
                  <Twitter size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#07111F] transition">
                  <Youtube size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Platform Links (2 Cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-[#07111F]">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" onClick={(e) => handleAnchorClick(e, "#how-it-works")} className="hover:text-[#07111F] transition">How it works</a></li>
                <li><a href="#live-pulse" onClick={(e) => handleAnchorClick(e, "#live-pulse")} className="hover:text-[#07111F] transition">Live Pulse</a></li>
                <li><Link to="/issues" className="hover:text-[#07111F] transition">Issues</Link></li>
                <li><Link to="/report" className="hover:text-[#07111F] transition">Report Issue</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources Links (2 Cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-[#07111F]">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#docs" className="hover:text-[#07111F] transition">Documentation</a></li>
                <li><a href="#privacy" className="hover:text-[#07111F] transition">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-[#07111F] transition">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-[#07111F] transition">Contact</a></li>
              </ul>
            </div>

            {/* Column 4: Subscribe (4 Cols) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-[#07111F]">Subscribe</h4>
              <p className="text-xs text-[#64748B]">
                Get updates about new features and city initiatives.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully!"); }} className="flex items-center relative max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-9 w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 pr-10 text-xs text-[#07111F] placeholder-[#94A3B8] focus:border-[#00A881] focus:bg-white focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#00A881] text-white hover:bg-[#008F70] transition shadow-xs"
                >
                  <Send size={11} className="-ml-0.5" />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-[#EAEFEA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <p>© 2024 CivicConnect. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span>Cleaner Cities. Brighter Tomorrow.</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A881]" />
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
