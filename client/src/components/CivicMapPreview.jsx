import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertTriangle, Eye, Layers } from "lucide-react";
import { api } from "../api.js";

export default function CivicMapPreview() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ active: 0, aiVerifiedCount: 0, resolved: 0 });
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPin, setSelectedPin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real issues and stats from backend
  useEffect(() => {
    let isMounted = true;
    async function loadMapData() {
      try {
        const [issuesRes, statsRes] = await Promise.allSettled([
          api.get("/issues"),
          api.get("/issues/stats")
        ]);

        if (issuesRes.status === "fulfilled" && Array.isArray(issuesRes.value.data?.issues)) {
          const list = issuesRes.value.data.issues;
          if (isMounted) {
            setIssues(list);
            if (list.length > 0) {
              setSelectedPin(list[0]);
            }
          }
        }

        if (statsRes.status === "fulfilled" && statsRes.value.data?.stats) {
          if (isMounted) {
            setStats(statsRes.value.data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to load map preview issues:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMapData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter issues based on real database attributes
  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === "all") return true;
    const phase = (issue.phase || issue.status || "").toUpperCase();
    const priority = (issue.priority || "").toUpperCase();

    if (activeFilter === "critical") {
      return priority === "URGENT" || priority === "HIGH";
    }
    if (activeFilter === "verified") {
      return phase === "RESOLUTION_REVIEW" || issue.citizenVerified;
    }
    if (activeFilter === "resolved") {
      return phase === "RESOLVED" || phase === "CLOSED";
    }
    return true;
  });

  // Calculate normalized coordinates on radar canvas
  function getPinPosition(issue, idx) {
    if (issues.length === 0) return { top: "50%", left: "50%" };
    
    // Center point anchor
    const centerLat = issues[0]?.latitude || 28.6139;
    const centerLng = issues[0]?.longitude || 77.2090;

    // Spread pins organically on the radar
    const angle = (idx * 2 * Math.PI) / (issues.length || 1) + 0.4;
    const radius = idx === 0 ? 0 : 25 + (idx % 3) * 12; // percentage offset

    const left = Math.min(85, Math.max(15, 50 + Math.cos(angle) * radius));
    const top = Math.min(85, Math.max(15, 50 + Math.sin(angle) * radius));

    return { top: `${top}%`, left: `${left}%` };
  }

  function getPinColor(issue) {
    const phase = (issue.phase || issue.status || "").toUpperCase();
    const priority = (issue.priority || "").toUpperCase();

    if (phase === "RESOLVED" || phase === "CLOSED") return "#10b981"; // Emerald Green
    if (priority === "URGENT" || priority === "HIGH") return "#ef4444"; // Red
    if (phase === "RESOLUTION_REVIEW" || issue.citizenVerified) return "#06b6d4"; // Cyan
    return "#f59e0b"; // Amber (In Progress / New)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-10 shadow-2xl text-white overflow-hidden relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>LIVE GEOSPATIAL COMMAND RADAR</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
              CIVIC ISSUES NEAR YOU
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
              Connected live to municipal database tracking active, verified, and community-audited issues.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
            {[
              { id: "all", label: "All" },
              { id: "critical", label: "Critical" },
              { id: "verified", label: "Verified" },
              { id: "resolved", label: "Resolved" }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFilter(id)}
                className={`rounded-xl px-3 py-1.5 uppercase font-bold transition cursor-pointer ${
                  activeFilter === id
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Big Interactive Map Canvas Viewport */}
        <div className="relative mt-8 h-[440px] sm:h-[500px] w-full rounded-2xl border border-slate-800 bg-[#050b14] overflow-hidden">
          {/* Cyber Vector Map Grid Lines */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15), transparent 70%),
                linear-gradient(to right, rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 40px 40px, 40px 40px"
            }}
          />

          {/* Concentric Radar Rings in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full border border-cyan-500/10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-cyan-500/5 pointer-events-none" />

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute top-1/2 left-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/20 border-dashed animate-radar pointer-events-none" />

          {/* Interactive Geographic Issue Pins from Real DB */}
          {filteredIssues.map((issue, idx) => {
            const isSelected = selectedPin?.id === issue.id;
            const pos = getPinPosition(issue, idx);
            const color = getPinColor(issue);

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedPin(issue)}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Expanding Pulse Ring */}
                <span
                  className="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none"
                  style={{ backgroundColor: color }}
                />

                {/* Pin Core */}
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg transition-transform group-hover:scale-125 ${
                    isSelected ? "scale-125 border-white ring-4 ring-cyan-400/30" : "border-slate-900"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  <MapPin size={14} className="text-slate-950 font-bold" />
                </div>

                {/* Mini Tooltip Badge on Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900/95 px-2.5 py-1 text-[11px] font-mono text-white shadow-xl pointer-events-none">
                  <span className="font-bold">{issue.title}</span>
                  <span className="text-slate-400">({issue.phase || issue.status})</span>
                </div>
              </div>
            );
          })}

          {/* Floating Map Statistics Card (Top Left) - Live Database Counts */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/85 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-xl">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> {stats.active} Active
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-300 font-semibold">{stats.aiVerifiedCount} Verified</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold">{stats.resolved} Resolved</span>
          </div>

          {/* Selected Real Pin Details Overlay Card (Bottom Right) */}
          {selectedPin && (
            <div className="absolute bottom-4 right-4 z-30 w-72 sm:w-84 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-[10px] text-cyan-400 font-bold">
                  {selectedPin.issueCode || "ISSUE"} // {selectedPin.address || "GPS VERIFIED"}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: `${getPinColor(selectedPin)}20`,
                    color: getPinColor(selectedPin),
                    border: `1px solid ${getPinColor(selectedPin)}50`
                  }}
                >
                  {selectedPin.phase || selectedPin.status}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-white line-clamp-1">
                {selectedPin.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-light capitalize">
                Category: {selectedPin.category || "General"}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">COORDINATES</span>
                  <span className="text-slate-300">
                    {selectedPin.latitude ? `${selectedPin.latitude.toFixed(4)}, ${selectedPin.longitude.toFixed(4)}` : "GPS Logged"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">COMMUNITY VOTES</span>
                  <span className="text-emerald-400 font-bold">{selectedPin.upvotes || 0} Upvotes</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/issues/${selectedPin.id}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>View Full Incident Report</span>
                  <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-500">LIVE TICKET</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
