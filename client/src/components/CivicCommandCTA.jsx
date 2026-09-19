import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, Camera, Sparkles, Activity, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function CivicCommandCTA() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950 p-8 sm:p-14 lg:p-16 text-white shadow-2xl">
        {/* Subtle procedural background elements: grid, network lines, radial lighting */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.25), transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.2), transparent 50%),
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px"
          }}
        />

        {/* Procedural geometric city silhouette outline (SVG) in background */}
        <div className="absolute bottom-0 right-0 w-full md:w-2/3 h-48 opacity-10 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 800 200" fill="none" className="w-full h-full object-cover">
            <rect x="50" y="80" width="40" height="120" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="100" y="40" width="55" height="160" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="170" y="90" width="35" height="110" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="220" y="20" width="60" height="180" stroke="#10b981" strokeWidth="1.5" />
            <rect x="295" y="60" width="45" height="140" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="355" y="110" width="50" height="90" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="420" y="50" width="65" height="150" stroke="#10b981" strokeWidth="1.5" />
            <rect x="500" y="30" width="40" height="170" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="555" y="80" width="70" height="120" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="640" y="60" width="50" height="140" stroke="#10b981" strokeWidth="1.5" />
            <line x1="0" y1="199" x2="800" y2="199" stroke="#38bdf8" strokeWidth="2" />
          </svg>
        </div>

        {/* Content Area */}
        <div className="relative z-10 max-w-2xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-mono font-bold text-emerald-300 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>CITIZEN INTELLIGENCE DISPATCH</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            YOUR CITY. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              YOUR VOICE.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Report an issue and let CivicConnect handle the rest. Real-time vision verification, automated officer dispatch, and cryptographic resolution transparency.
          </p>

          {/* Interactive CTAs with glide micro-animations */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={user ? "/report" : "/login"}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-4 font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-95"
            >
              <span>Report an Issue</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                →
              </span>
            </Link>

            <Link
              to="/issues"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4 font-bold text-white backdrop-blur-md hover:bg-slate-800 hover:border-slate-600 transition"
            >
              <MapPinned size={18} className="text-cyan-400" />
              <span>Explore Civic Map</span>
            </Link>
          </div>

          {/* Small Live Statistics Under Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-200 font-bold">24 Active Issues</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-200 font-bold">18 Resolved Today</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>100% Anti-Fraud Audit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
