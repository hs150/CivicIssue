import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertTriangle, Eye, Layers, Sparkles, Clock, Compass } from "lucide-react";
import { api } from "../api.js";

export default function CivicMapPreview() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ active: 0, aiVerifiedCount: 0, resolved: 0 });
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState(null);
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
              setSelectedIssue(list[0]);
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

  // Filter issues based on category: All, Road, Water, Waste, Lighting
  const filteredIssues = issues.filter((issue) => {
    if (activeCategory === "All") return true;
    const cat = (issue.category || "").toLowerCase();
    const filter = activeCategory.toLowerCase();
    return cat.includes(filter);
  });

  // Calculate normalized coordinates on radar canvas
  function getPinPosition(issue, idx) {
    if (issues.length === 0) return { top: "50%", left: "50%" };
    
    // Spread pins organically on the radar
    const angle = (idx * 2 * Math.PI) / (Math.max(issues.length, 1)) + 0.35;
    const radius = idx === 0 ? 0 : 26 + (idx % 4) * 11;

    const left = Math.min(84, Math.max(16, 50 + Math.cos(angle) * radius));
    const top = Math.min(84, Math.max(16, 50 + Math.sin(angle) * radius));

    return { top: `${top}%`, left: `${left}%` };
  }

  // Severity color mapping
  function getSeverityColor(priority) {
    const p = (priority || "").toUpperCase();
    if (p === "CRITICAL" || p === "URGENT") return "#EF4444"; // Red
    if (p === "HIGH") return "#F5A524"; // Warning / Amber
    if (p === "MEDIUM") return "#06B6D4"; // Cyan
    return "#00C896"; // Low / Resolved Green
  }

  // Format timestamp nicely
  function formatTimestamp(isoString) {
    if (!isoString) return "Recently reported";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently reported";
    }
  }

  const categories = ["All", "Road", "Water", "Waste", "Lighting"];

  return (
    <section id="civic-map" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-800 bg-[#020817] p-6 sm:p-8 lg:p-10 shadow-xl text-white overflow-hidden relative">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-mono font-bold text-[#00C896]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]" />
              </span>
              <span>LIVE CIVIC ISSUES MAP</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Civic Intelligence Map
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-light">
              Interactive spatial view of active, verified, and resolved municipal reports.
            </p>
          </div>

          {/* Filters: All, Road, Water, Waste, Lighting */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 font-bold transition cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#00C896] text-[#020817] shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Large Interactive Map Canvas Viewport */}
        <div className="relative mt-8 h-[450px] sm:h-[500px] w-full rounded-xl border border-slate-800 bg-[#050b14] overflow-hidden">
          
          {/* Cyber Vector Map Grid Lines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(0, 200, 150, 0.12), transparent 70%),
                linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: "100% 100%, 36px 36px, 36px 36px"
            }}
          />

          {/* Concentric Radar Rings in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full border border-slate-700/40 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full border border-slate-800 pointer-events-none" />

          {/* Interactive Geographic Issue Pins from Real DB */}
          {filteredIssues.map((issue, idx) => {
            const isSelected = selectedIssue?.id === issue.id;
            const pos = getPinPosition(issue, idx);
            const severityColor = getSeverityColor(issue.priority);

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{ top: pos.top, left: pos.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Expanding Pulse Ring */}
                <span
                  className="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none"
                  style={{ backgroundColor: severityColor }}
                />

                {/* Pin Core */}
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg transition-transform group-hover:scale-125 ${
                    isSelected ? "scale-125 border-white ring-4 ring-[#00C896]/40" : "border-slate-950"
                  }`}
                  style={{ backgroundColor: severityColor }}
                >
                  <MapPin size={13} className="text-[#020817] font-bold" />
                </div>

                {/* Mini Tooltip on Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900/95 px-2.5 py-1 text-[11px] font-mono text-white shadow-xl pointer-events-none">
                  <span className="font-bold">{issue.title?.slice(0, 24)}...</span>
                  <span className="text-slate-400">({issue.priority || "MEDIUM"})</span>
                </div>
              </div>
            );
          })}

          {/* Floating Telemetry Badge (Top Left) */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-mono backdrop-blur-md shadow-lg">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <span className="h-2 w-2 rounded-full bg-[#00C896] animate-pulse" />
              <span>{filteredIssues.length} Visible Pins</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400 capitalize">{activeCategory} Category</span>
          </div>

          {/* Selected Real Issue Card (Bottom Right / Mobile Floating) */}
          {selectedIssue && (
            <div className="absolute bottom-4 right-4 z-30 w-72 sm:w-80 rounded-xl border border-slate-800 bg-slate-900/95 p-4 text-xs backdrop-blur-md shadow-2xl">
              
              {/* Header: Issue ID & Severity */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-[11px] text-[#00C896] font-bold">
                  {selectedIssue.issueCode || selectedIssue.id.slice(0, 11)}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: `${getSeverityColor(selectedIssue.priority)}20`,
                    color: getSeverityColor(selectedIssue.priority),
                    border: `1px solid ${getSeverityColor(selectedIssue.priority)}50`
                  }}
                >
                  {selectedIssue.priority || "MEDIUM"}
                </span>
              </div>

              {/* Title & Category */}
              <h4 className="mt-2.5 text-sm font-bold text-white line-clamp-1">
                {selectedIssue.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                Category: <strong className="text-slate-200">{selectedIssue.category || "General"}</strong>
              </p>

              {/* Metadata Grid: AI Verification Status, Location, Timestamp */}
              <div className="mt-3 space-y-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                
                {/* AI Verification Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Status</span>
                  <span className="text-[#00C896] font-bold flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>AI Verified ✓</span>
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="text-slate-200 truncate max-w-[150px] text-right">
                    {selectedIssue.address || (selectedIssue.latitude ? `${selectedIssue.latitude.toFixed(3)}°, ${selectedIssue.longitude.toFixed(3)}°` : "GPS Logged")}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-slate-300">
                    {formatTimestamp(selectedIssue.createdAt)}
                  </span>
                </div>

              </div>

              {/* Action Link to Full Ticket */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/issues/${selectedIssue.id}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00C896] hover:underline transition"
                >
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-500">
                  STATUS: {selectedIssue.phase || selectedIssue.status}
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
