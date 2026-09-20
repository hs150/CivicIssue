import { useState } from "react";
import { Camera, Sparkles, MapPin, Route, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const PIPELINE_NODES = [
  {
    step: "01",
    label: "INTAKE",
    title: "Report",
    shortDesc: "Citizen submits an issue with photo evidence, GPS coordinates, and optional voice notes.",
    icon: Camera,
    color: "bg-[#00C896] text-[#020817]",
    verificationBadge: "Geotagged & EXIF Validated",
    details: "High-resolution camera tensor captures precise latitude/longitude, timestamp, and device orientation without telemetry spoofing."
  },
  {
    step: "02",
    label: "VISION AI",
    title: "AI Inspection",
    shortDesc: "Gemini Vision detects damage classification, severity rating, and department jurisdiction.",
    icon: Sparkles,
    color: "bg-[#07111F] text-[#00C896]",
    verificationBadge: "Multimodal Gemini 2.5",
    details: "Evaluates asphalt cracks, water main ruptures, street lighting outages, or waste hazards with 94%+ automated accuracy."
  },
  {
    step: "03",
    label: "DEDUPLICATION",
    title: "Evidence Verification",
    shortDesc: "500m Haversine radius scan checks for duplicate tickets and anti-fraud image consistency.",
    icon: MapPin,
    color: "bg-[#07111F] text-cyan-400",
    verificationBadge: "500m Proximity Engine",
    details: "Matches nearby active tickets to aggregate community upvotes and eliminate duplicate municipal work orders."
  },
  {
    step: "04",
    label: "DISPATCH",
    title: "Officer Action",
    shortDesc: "Dispatched to the municipal field officer with route optimization and physical work order.",
    icon: Route,
    color: "bg-[#07111F] text-amber-400",
    verificationBadge: "SLA Route Optimization",
    details: "Officers access verified GIS coordinates, task priority, and real-time equipment routing on their field console."
  },
  {
    step: "05",
    label: "PROOF-OF-FIX",
    title: "Citizen Resolution",
    shortDesc: "Resolution proof photo uploaded. Before/After comparison and citizen sign-off close the ticket.",
    icon: ShieldCheck,
    color: "bg-[#008F70] text-white",
    verificationBadge: "Tamper-Proof Audit",
    details: "Generates an immutable public municipal ledger certificate with community dispute window before final closure."
  }
];

export default function CivicWorkflowSection() {
  const [activeIdx, setActiveIdx] = useState(1);

  return (
    <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#008F70] bg-[#00C896]/10 px-3.5 py-1.5 rounded-full border border-[#00C896]/20">
          END-TO-END CIVIC PIPELINE
        </div>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#07111F]">
          How CivicConnect Works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
          From initial citizen photo intake to AI verification, field dispatch, and community-audited resolution.
        </p>
      </div>

      {/* Interactive Horizontal 5-Step Process */}
      <div className="relative mt-12">
        {/* Animated Connecting SVG Line across desktop */}
        <div className="hidden lg:block absolute top-[52px] left-12 right-12 h-1 z-0 pointer-events-none">
          <svg className="w-full h-3 overflow-visible">
            <line
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#DDE5E1"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <line
              x1="0%"
              y1="50%"
              x2={`${(activeIdx / (PIPELINE_NODES.length - 1)) * 100}%`}
              y2="50%"
              stroke="#00C896"
              strokeWidth="3"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        </div>

        {/* 5 Process Cards */}
        <div className="relative z-10 grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {PIPELINE_NODES.map((node, idx) => {
            const Icon = node.icon;
            const isCurrent = activeIdx === idx;
            return (
              <div
                key={node.step}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "-translate-y-1.5 bg-white border-[#00C896] shadow-md shadow-[#00C896]/10 ring-1 ring-[#00C896]/40"
                    : "bg-white/90 border-[#DDE5E1] hover:border-slate-400 hover:shadow-xs"
                }`}
              >
                <div>
                  {/* Top Step & Label */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded ${
                        isCurrent ? "bg-[#00C896] text-[#020817]" : "bg-slate-100 text-[#64748B]"
                      }`}
                    >
                      {node.step}
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#64748B] uppercase">
                      {node.label}
                    </span>
                  </div>

                  {/* Icon Node */}
                  <div
                    className={`mt-4 grid h-11 w-11 place-items-center rounded-xl ${node.color} shadow-sm transition-transform duration-200 ${
                      isCurrent ? "scale-105 ring-2 ring-[#00C896]/30" : "scale-100"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Step Title */}
                  <h3 className="text-base font-bold text-[#07111F] leading-snug mt-3">
                    {node.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
                    {node.shortDesc}
                  </p>
                </div>

                {/* Expanded Verification Details (Reveals on hover/active) */}
                <div
                  className={`mt-4 pt-3 border-t border-[#DDE5E1] text-[11px] transition-all duration-200 ${
                    isCurrent ? "opacity-100 block" : "opacity-0 hidden lg:block lg:opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#008F70] mb-1">
                    <CheckCircle2 size={11} />
                    <span>{node.verificationBadge}</span>
                  </div>
                  <p className="text-[#64748B] leading-normal text-[11px]">{node.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
