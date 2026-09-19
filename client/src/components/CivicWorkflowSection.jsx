import { useState } from "react";
import { Camera, Sparkles, MapPin, Route, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const PIPELINE_NODES = [
  {
    step: "01",
    label: "CITIZEN INTAKE",
    title: "Multimodal Visual Report",
    shortDesc: "Citizen snaps evidence photo with automatic GPS telemetry and audio complaint transcription.",
    icon: Camera,
    color: "from-emerald-500 to-teal-600",
    badge: "Input Stream",
    details: "Voice in Hindi or English, camera orientation, and precise satellite coordinates are captured simultaneously."
  },
  {
    step: "02",
    label: "NEURAL AUDIT",
    title: "AI Vision Inspection",
    shortDesc: "Gemini Vision classifies category, severity rating, hazard potential, and municipal jurisdiction in <2s.",
    icon: Sparkles,
    color: "from-teal-500 to-cyan-600",
    badge: "Gemini Vision",
    details: "Identifies asphalt degradation, water pipe rupture, electrical hazards, or illegal debris accumulation."
  },
  {
    step: "03",
    label: "SPATIAL CLUSTER",
    title: "500m Geo-Verification",
    shortDesc: "Automated Haversine radius scans for duplicate tickets within 500 meters to prevent duplicate work orders.",
    icon: MapPin,
    color: "from-blue-500 to-indigo-600",
    badge: "Haversine Engine",
    details: "Existing reports aggregate upvotes and community priority rather than fragmenting municipal resources."
  },
  {
    step: "04",
    label: "DYNAMIC DISPATCH",
    title: "Officer Route Optimization",
    shortDesc: "Dispatches assigned field units with priority TSP route optimizer for lowest travel latency.",
    icon: Route,
    color: "from-indigo-500 to-purple-600",
    badge: "TSP Router",
    details: "Officers view assigned geographic corridors and work order certificates directly on their mobile desk."
  },
  {
    step: "05",
    label: "PROOF-OF-FIX",
    title: "Citizen-Verified Resolution",
    shortDesc: "Officer uploads resolution photo. Before/After neural comparison and 2-party community sign-off seal the ticket.",
    icon: ShieldCheck,
    color: "from-emerald-600 to-teal-700",
    badge: "Consensus Seal",
    details: "Generates an immutable Government Work Order Certificate with SHA256 digital stamp and A4 print audit."
  }
];

export default function CivicWorkflowSection() {
  const [hoveredIdx, setHoveredIdx] = useState(1);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          SYSTEM ARCHITECTURE
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
          HOW CIVICCONNECT WORKS
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed font-light">
          An automated, tamper-proof operational pipeline linking citizen report intake directly to verified municipal infrastructure resolution.
        </p>
      </div>

      {/* Interactive Horizontal Pipeline Visualizer */}
      <div className="relative mt-14">
        {/* Animated Connecting SVG Line across desktop */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-8 h-1 z-0">
          <svg className="w-full h-4 overflow-visible">
            <line
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <line
              x1="0%"
              y1="50%"
              x2={`${(hoveredIdx / (PIPELINE_NODES.length - 1)) * 100}%`}
              y2="50%"
              stroke="#059669"
              strokeWidth="3"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        </div>

        {/* 5 Node Cards */}
        <div className="relative z-10 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {PIPELINE_NODES.map((node, idx) => {
            const Icon = node.icon;
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={node.step}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`group relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-300 cursor-pointer ${
                  isHovered
                    ? "-translate-y-2.5 bg-white border-emerald-500 shadow-xl shadow-emerald-700/10 ring-2 ring-emerald-500/20"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  {/* Top Step & Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-black tracking-widest px-2 py-0.5 rounded-md ${
                        isHovered ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {node.step}
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">
                      {node.badge}
                    </span>
                  </div>

                  {/* Icon Node */}
                  <div
                    className={`mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${node.color} text-white shadow-md transition-transform duration-300 ${
                      isHovered ? "scale-110 ring-4 ring-emerald-400/25" : "scale-100"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  {/* Labels */}
                  <p className="mt-4 font-mono text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                    {node.label}
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
                    {node.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                    {node.shortDesc}
                  </p>
                </div>

                {/* Expanded State Details on Active/Hovered Node */}
                <div
                  className={`mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 transition-opacity duration-300 ${
                    isHovered ? "opacity-100 block" : "opacity-0 hidden lg:block lg:opacity-40"
                  }`}
                >
                  <span className="font-semibold text-emerald-800 block mb-0.5">Operational Detail:</span>
                  <p className="leading-normal">{node.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
