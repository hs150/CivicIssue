import { useState } from "react";
import {
  ArrowRight, CheckCircle2, MapPinned, ShieldCheck,
  Sparkles, Camera, MapPin, Route, ShieldAlert,
  ArrowLeftRight, Zap, Check, Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LIFECYCLE_STEPS = [
  {
    step: "01",
    title: "AI Visual Inspection",
    subtitle: "Multimodal Gemini Vision",
    description: "Citizen captures an issue photo. Gemini Vision auto-detects category, severity, hazard level, and department routing in seconds.",
    icon: Camera,
    color: "from-emerald-500 to-teal-600",
    badge: "Gemini Vision"
  },
  {
    step: "02",
    title: "Geo-Deduplication",
    subtitle: "500m Proximity Clustering",
    description: "Real-time Haversine proximity scanning warns citizens of duplicate reports within 500m and redirects them to upvote.",
    icon: MapPin,
    color: "from-blue-500 to-indigo-600",
    badge: "Haversine Radius"
  },
  {
    step: "03",
    title: "Officer Route Optimizer",
    subtitle: "Nearest-Neighbor Dispatch",
    description: "Field officers receive an interactive GPS priority map with an automated TSP route optimizer to minimize travel time.",
    icon: Route,
    color: "from-amber-500 to-orange-600",
    badge: "TSP Optimizer"
  },
  {
    step: "04",
    title: "Proof-of-Fix Anti-Fraud",
    subtitle: "Before vs After AI Comparison",
    description: "Officers cannot mark issues resolved without a fix photo. Gemini compares before and after images to detect location mismatches and fraud.",
    icon: ShieldCheck,
    color: "from-purple-500 to-rose-600",
    badge: "Anti-Corruption"
  }
];

export default function Home() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="space-y-20 pb-16">
      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden pt-8 md:pt-16">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div>
            {/* Top glowing feature pill badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                <Sparkles size={12} className="text-emerald-600" /> Powered by Gemini AI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800 shadow-xs">
                <ShieldCheck size={12} className="text-indigo-600" /> Proof-of-Fix Verification
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-xs">
                <MapPin size={12} className="text-amber-600" /> 500m Geo-Dedup
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
              Report problems. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Verify fixes with AI.</span> Restore civic trust.
            </h1>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
              CivicConnect transforms municipal problem solving into a tamper-proof civic operating system. Featuring multimodal Gemini inspection, automatic duplicate prevention, and before vs. after proof-of-fix verification.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to={user ? "/report" : "/login"}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-700 hover:to-teal-800 transition active:scale-95"
              >
                Report an Issue <ArrowRight size={18} />
              </Link>
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition"
              >
                Explore Issues Map
              </Link>
            </div>
          </div>

          {/* Hero Interactive Preview Card */}
          <div className="relative">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
              <div className="rounded-2xl bg-slate-950 p-6 text-white relative overflow-hidden">
                {/* Background radar sweep */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-slate-300">#CC-84920412</span>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                    RESOLUTION REVIEW
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-black text-white">Severed Water Pipeline & Flooding</p>
                  <span className="rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 border border-rose-500/30">
                    URGENT
                  </span>
                </div>

                {/* AI Detection Card */}
                <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sparkles size={12} className="text-teal-400" /> Gemini Vision Confidence:
                    </span>
                    <span className="font-bold text-emerald-400">96.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Detected Category:</span>
                    <span className="font-bold text-slate-200">🚰 Water & Municipal Drainage</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Anti-Corruption Fix:</span>
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck size={12} /> Landmark Verified
                    </span>
                  </div>
                </div>

                {/* Phase Pipeline Bar */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  {["New", "In Progress", "Review", "Resolved"].map((step, idx) => (
                    <div key={step} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          idx <= 2 ? "bg-emerald-400 ring-4 ring-emerald-400/20" : "bg-slate-700"
                        }`}
                      />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          METRICS BANNER
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-emerald-700">99.4%</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">AI Hazard Detection Accuracy</p>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">500m</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Radius Proximity Geo-Dedup</p>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <p className="text-3xl sm:text-4xl font-black text-indigo-700">100%</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Anti-Corruption Photo Trails</p>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <p className="text-3xl sm:text-4xl font-black text-emerald-700">&lt; 24h</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Average Officer Dispatch Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4-STEP AI LIFECYCLE BREAKDOWN
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            End-to-End Architecture
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            The 4-Step Anti-Corruption Pipeline
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            From the instant a citizen points their camera to the final officer audit report, every transition is backed by vision intelligence.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {step.step}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {step.badge}
                    </span>
                  </div>

                  <div className={`mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-md`}>
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">{step.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{step.subtitle}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          CTA SECTION
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-8 sm:p-14 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to report or inspect in your ward?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-emerald-200/90 leading-relaxed">
              Experience the future of civic problem solving. Live camera analysis, instant fraud detection, and verifiable transparency for citizens and local authorities alike.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={user ? "/report" : "/login"}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-slate-900 shadow-md hover:bg-slate-100 transition"
              >
                Launch Citizen Camera <Camera size={18} />
              </Link>
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-md hover:bg-white/20 transition"
              >
                View Community Map <MapPinned size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
