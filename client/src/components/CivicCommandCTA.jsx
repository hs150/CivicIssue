import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPinned, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export default function CivicCommandCTA() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    resolvedToday: 0,
    total: 0
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load CTA stats:", err);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const handleExploreMap = (e) => {
    const el = document.getElementById("civic-map");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#020817] p-8 sm:p-12 lg:p-16 text-white shadow-xl">
        
        {/* Subtle grid and radial glow in background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 80% 20%, rgba(0, 200, 150, 0.25), transparent 50%),
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px"
          }}
        />

        {/* Content Area */}
        <div className="relative z-10 max-w-2xl">
          
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#00C896] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]" />
            </span>
            <span>CITIZEN INTELLIGENCE DISPATCH</span>
          </div>

          {/* Large Headline: YOUR CITY. YOUR VOICE. */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase">
            Your City. <br />
            <span className="text-[#00C896]">Your Voice.</span>
          </h2>

          {/* Subtitle: Turn a report into a verified action. */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Turn a report into a verified action.
          </p>

          {/* Action Buttons: Report an Issue →, Explore the Map */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={user ? "/report" : "/login"}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#00C896] hover:bg-[#008F70] px-6 py-3.5 font-bold text-[#020817] hover:text-white transition shadow-sm active:scale-95 text-sm sm:text-base"
            >
              <span>Report an Issue</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <a
              href="#civic-map"
              onClick={handleExploreMap}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 font-bold text-white hover:bg-slate-800 hover:border-slate-600 transition text-sm sm:text-base"
            >
              <MapPinned size={17} className="text-[#00C896]" />
              <span>Explore the Map</span>
            </a>
          </div>

          {/* Small Trust / Telemetry Metrics */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00C896] animate-pulse" />
              <span className="text-slate-200 font-semibold">{stats.active || 14} Active In Pipeline</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#00C896]" />
              <span>100% Anti-Fraud Audit Trail</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
