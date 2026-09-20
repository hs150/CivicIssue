import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, X, Plus, Search, Moon, Sun, Send, Github, Linkedin, Twitter, Youtube, ChevronDown, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import CivicLogo from "./CivicLogo.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleMode, isDark, activeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const close = () => {
    setOpen(false);
    setProfileOpen(false);
  };

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
      {/* =========================================================
          STICKY NAVBAR (Minimal, Spacious, Never Wrapping)
      ========================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "py-2.5 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-2xs"
            : "py-3 bg-white dark:bg-black border-b border-neutral-200/70 dark:border-neutral-800/70"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-neutral-900 dark:text-white group shrink-0"
            onClick={close}
          >
            <CivicLogo size={32} className="group-hover:scale-105" />
            <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
              CivicConnect
            </span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3.5 py-1.5 transition ${
                  isActive && location.hash === ""
                    ? "font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800"
                    : "hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
                }`
              }
            >
              Home
            </NavLink>

            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
            >
              How it works
            </a>

            <a
              href="#live-pulse"
              onClick={(e) => handleAnchorClick(e, "#live-pulse")}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
            >
              Live Pulse
            </a>

            <NavLink
              to="/issues"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3.5 py-1.5 transition ${
                  isActive
                    ? "font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800"
                    : "hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
                }`
              }
            >
              Issues
            </NavLink>

            <a
              href="#about"
              onClick={(e) => handleAnchorClick(e, "#about")}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition hover:text-black dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
            >
              About
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Search Input Bar (Visible on xl+ screens) */}
            <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative">
              <Search size={13} className="absolute left-3 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues..."
                className="h-8.5 w-36 2xl:w-44 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 pl-8 pr-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:outline-none transition"
              />
            </form>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleMode}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition shadow-2xs cursor-pointer active:scale-90 shrink-0"
              title={`Switch to ${isDark ? "White & Black (Light)" : "Black & White (Dark)"}`}
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <Sun size={15} className="text-white transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon size={15} className="text-black transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* "Report Issue +" Pill Button (Single line, never wraps) */}
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-3.5 sm:px-4 py-2 text-xs font-bold transition shadow-xs active:scale-95"
            >
              <span>Report Issue</span>
              <Plus size={14} strokeWidth={2.5} />
            </Link>

            {/* User Profile Dropdown or Login */}
            {user ? (
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1 rounded-full p-0.5 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition cursor-pointer"
                  title={user.email}
                  aria-label="User profile menu"
                >
                  <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-xs font-bold text-white dark:text-black">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown size={12} className="text-neutral-500 mr-1 hidden sm:block" />
                </button>

                {/* Floating Dropdown Card */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 shadow-xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">{user.name || "Citizen"}</p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/my-issues"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition"
                      >
                        <FileText size={14} />
                        <span>My Issues</span>
                      </Link>

                      {user.role !== "citizen" && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition"
                        >
                          <ShieldCheck size={14} />
                          <span>Officer Desk</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center whitespace-nowrap shrink-0 text-xs font-bold rounded-full px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Hamburger (Only on < lg) */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 p-1 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {open && (
          <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 py-4 space-y-2 shadow-lg">
            <NavLink
              to="/"
              onClick={close}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive && location.hash === ""
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`
              }
            >
              Home
            </NavLink>
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              How it works
            </a>
            <a
              href="#live-pulse"
              onClick={(e) => handleAnchorClick(e, "#live-pulse")}
              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Live Pulse
            </a>
            <NavLink
              to="/issues"
              onClick={close}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`
              }
            >
              Issues
            </NavLink>
            <a
              href="#about"
              onClick={(e) => handleAnchorClick(e, "#about")}
              className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              About
            </a>

            {user && (
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 my-2">
                <NavLink
                  to="/my-issues"
                  onClick={close}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  My Issues
                </NavLink>
                {user.role !== "citizen" && (
                  <NavLink
                    to="/dashboard"
                    onClick={close}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    Officer Desk
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* =========================================================
          FOOTER (Exact Match to Screenshot)
          Clean light background, 4 columns, subscription box, bottom note
      ========================================================= */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Column 1: Brand, Tagline, Description & Socials (4 Cols) */}
            <div className="md:col-span-4 space-y-3">
              <Link to="/" className="flex items-center gap-2.5 font-bold text-neutral-900 dark:text-white group">
                <CivicLogo size={26} className="group-hover:scale-105" />
                <span className="text-base font-extrabold tracking-tight">CivicConnect</span>
              </Link>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Cleaner Cities. Stronger Communities.
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
                A transparent, citizen-driven platform for cleaner, safer and smarter cities.
              </p>
              <div className="flex items-center gap-3 pt-2 text-neutral-400 dark:text-neutral-500">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition">
                  <Github size={16} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition">
                  <Linkedin size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition">
                  <Twitter size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition">
                  <Youtube size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Platform Links (2 Cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" onClick={(e) => handleAnchorClick(e, "#how-it-works")} className="hover:text-black dark:hover:text-white transition">How it works</a></li>
                <li><a href="#live-pulse" onClick={(e) => handleAnchorClick(e, "#live-pulse")} className="hover:text-black dark:hover:text-white transition">Live Pulse</a></li>
                <li><Link to="/issues" className="hover:text-black dark:hover:text-white transition">Issues</Link></li>
                <li><Link to="/report" className="hover:text-black dark:hover:text-white transition">Report Issue</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources Links (2 Cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#docs" className="hover:text-black dark:hover:text-white transition">Documentation</a></li>
                <li><a href="#privacy" className="hover:text-black dark:hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-black dark:hover:text-white transition">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-black dark:hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            {/* Column 4: Subscribe (4 Cols) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Subscribe</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Get updates about new features and city initiatives.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully!"); }} className="flex items-center relative max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-9 w-full rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 pr-10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition shadow-xs"
                >
                  <Send size={11} className="-ml-0.5" />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 dark:text-neutral-500">
            <p>© 2024 CivicConnect. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <span>Cleaner Cities. Brighter Tomorrow.</span>
              <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
