import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertTriangle, Eye, Layers } from "lucide-react";

export const MOCK_MAP_ISSUES = [
  {
    id: "CC-84920",
    title: "Structural Road Fracture & Pothole",
    category: "Road Infrastructure",
    status: "AI VERIFIED",
    severity: "HIGH",
    lat: 28.6139,
    lng: 77.2090,
    top: "42%",
    left: "48%",
    color: "#06b6d4",
    type: "verified",
    ward: "Ward 14 • Central Delhi",
    upvotes: 42
  },
  {
    id: "CC-84921",
    title: "High-Voltage Cable Exposure Near Park",
    category: "Electrical Hazard",
    status: "CRITICAL",
    severity: "CRITICAL",
    lat: 28.6250,
    lng: 77.2150,
    top: "28%",
    left: "62%",
    color: "#ef4444",
    type: "critical",
    ward: "Ward 11 • Connaught Outer",
    upvotes: 89
  },
  {
    id: "CC-84922",
    title: "Municipal Drain Blockage Cleared",
    category: "Sanitation & Drainage",
    status: "RESOLVED",
    severity: "RESOLVED",
    lat: 28.6010,
    lng: 77.1980,
    top: "68%",
    left: "34%",
    color: "#10b981",
    type: "resolved",
    ward: "Ward 18 • Chanakyapuri",
    upvotes: 31
  },
  {
    id: "CC-84923",
    title: "Non-Functional Highway Streetlights",
    category: "Lighting & Transit",
    status: "ACTIVE",
    severity: "MEDIUM",
    lat: 28.6320,
    lng: 77.1850,
    top: "35%",
    left: "22%",
    color: "#f59e0b",
    type: "active",
    ward: "Ward 07 • Karol Bagh Corridor",
    upvotes: 19
  },
  {
    id: "CC-84924",
    title: "Main Water Distribution Pipe Repaired",
    category: "Water Works",
    status: "RESOLVED",
    severity: "RESOLVED",
    lat: 28.5850,
    lng: 77.2250,
    top: "78%",
    left: "72%",
    color: "#10b981",
    type: "resolved",
    ward: "Ward 22 • Lodhi District",
    upvotes: 54
  }
];

export default function CivicMapPreview() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPin, setSelectedPin] = useState(MOCK_MAP_ISSUES[0]);

  const filteredIssues = activeFilter === "all"
    ? MOCK_MAP_ISSUES
    : MOCK_MAP_ISSUES.filter(i => i.type === activeFilter);

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
              <span>GEOSPATIAL COMMAND RADAR</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
              CIVIC ISSUES NEAR YOU
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
              Interactive municipal grid tracking open, verified, and community-certified civic incidents in real time.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
            {["all", "critical", "verified", "resolved"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-3 py-1.5 uppercase font-bold transition cursor-pointer ${
                  activeFilter === filter
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter}
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

          {/* Interactive Geographic Issue Pins */}
          {filteredIssues.map((issue) => {
            const isSelected = selectedPin?.id === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedPin(issue)}
                style={{ top: issue.top, left: issue.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Expanding Pulse Ring */}
                <span
                  className="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none"
                  style={{ backgroundColor: issue.color }}
                />

                {/* Pin Core */}
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg transition-transform group-hover:scale-125 ${
                    isSelected ? "scale-125 border-white ring-4 ring-cyan-400/30" : "border-slate-900"
                  }`}
                  style={{ backgroundColor: issue.color }}
                >
                  <MapPin size={14} className="text-slate-950 font-bold" />
                </div>

                {/* Mini Tooltip Badge on Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900/95 px-2.5 py-1 text-[11px] font-mono text-white shadow-xl pointer-events-none">
                  <span className="font-bold">{issue.title}</span>
                  <span className="text-slate-400">({issue.status})</span>
                </div>
              </div>
            );
          })}

          {/* Floating Map Statistics Card (Top Left) */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/85 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-xl">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> 24 Active
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-300 font-semibold">17 Verified</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold">9 Resolved</span>
          </div>

          {/* Selected Pin Details Overlay Card (Bottom Right) */}
          {selectedPin && (
            <div className="absolute bottom-4 right-4 z-30 w-72 sm:w-80 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-[10px] text-cyan-400 font-bold">
                  {selectedPin.id} // {selectedPin.ward}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: `${selectedPin.color}20`,
                    color: selectedPin.color,
                    border: `1px solid ${selectedPin.color}50`
                  }}
                >
                  {selectedPin.status}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-white line-clamp-1">
                {selectedPin.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-light">
                {selectedPin.category}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">COORDINATES</span>
                  <span className="text-slate-300">{selectedPin.lat}, {selectedPin.lng}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">COMMUNITY VOTES</span>
                  <span className="text-emerald-400 font-bold">{selectedPin.upvotes} Upvotes</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to="/issues"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>Open Full Municipal Map</span>
                  <ArrowRight size={12} />
                </Link>
                <span className="text-[10px] font-mono text-slate-500">LIVE GPS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
