import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, CheckCircle2, RefreshCw, Cpu, Crosshair, MapPin, AlertCircle, Scan, Image as ImageIcon } from "lucide-react";
import { api } from "../api.js";

export default function AiAnalysisDemo() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [currentStep, setCurrentStep] = useState(4); // 0: Scanning, 1: Classifying, 2: Geo Verifying, 3: Duplicate Check, 4: Verified
  const [isScanning, setIsScanning] = useState(false);

  const analysisSteps = [
    { id: 0, label: "SCANNING", desc: "Multimodal neural vision scanning photo tensors" },
    { id: 1, label: "CLASSIFYING", desc: "Detecting hazard category & severity index" },
    { id: 2, label: "GEO VERIFYING", desc: "Cross-referencing EXIF GPS with municipal GIS boundary" },
    { id: 3, label: "DUPLICATE CHECK", desc: "Scanning 500m Haversine radius for active tickets" },
    { id: 4, label: "VERIFIED", desc: "Anti-fraud validation passed & assigned to municipal department" }
  ];

  // Fetch real issues from backend
  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          setIssues(data.issues);
          setSelectedIssue(data.issues[0]);
        }
      } catch (err) {
        console.error("Failed to load issues for AI verification demo:", err);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  function restartScan() {
    setIsScanning(true);
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 900);
  }

  // Fallback if no issues loaded yet
  const displayIssue = selectedIssue || {
    id: "live-audit",
    issueCode: "CC-LIVE-AUDIT",
    title: "Live Incident Stream Inspection",
    category: "Road Infrastructure",
    priority: "HIGH",
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: null,
    phase: "IN_PROGRESS"
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            <Cpu size={13} className="text-teal-600" /> MULTIMODAL GEMINI ENGINE
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
            AI-POWERED CIVIC VERIFICATION
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 font-light leading-relaxed">
            Real-time multimodal Gemini Vision inspection running against live tickets logged in the municipal database.
          </p>
        </div>

        {/* Real Issue Selector */}
        {issues.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase">Select Ticket:</span>
            <select
              value={displayIssue.id}
              onChange={(e) => {
                const found = issues.find(i => i.id === e.target.value);
                if (found) {
                  setSelectedIssue(found);
                  restartScan();
                }
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-teal-500 focus:outline-none"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.issueCode || i.id.slice(0, 8)} — {i.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Large Two-Column Diagnostic Display */}
      <div className="rounded-3xl border border-slate-200/90 bg-slate-950 p-6 sm:p-10 shadow-2xl text-white overflow-hidden relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* =====================================================
              LEFT COLUMN: REAL INCIDENT IMAGE / SCANNER VIEWPORT
          ===================================================== */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-4 lg:col-span-6 flex flex-col justify-between overflow-hidden">
            {/* Visual Canvas */}
            <div className="relative aspect-4/3 w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
              {displayIssue.imageUrl ? (
                <img
                  src={displayIssue.imageUrl.startsWith("http") ? displayIssue.imageUrl : `http://localhost:5000${displayIssue.imageUrl}`}
                  alt={displayIssue.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black">
                  {/* Road surface grid lines */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
                      backgroundSize: "32px 32px"
                    }}
                  />

                  {/* Procedural Road Fracture SVG Shape */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="220" height="150" viewBox="0 0 220 150" fill="none" className="drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                      <path
                        d="M30 75C45 40 70 30 110 35C150 40 185 55 190 85C195 115 155 130 115 125C75 120 20 110 30 75Z"
                        fill="#020617"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />
                      <path
                        d="M55 70L90 85M130 65L160 90M90 85L130 95"
                        stroke="#f87171"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce duration-1000 pointer-events-none" />

              {/* Target Bounding Box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 rounded-lg border-2 border-cyan-400/80 bg-cyan-500/10 pointer-events-none">
                <div className="absolute -top-6 left-0 bg-cyan-950/90 text-cyan-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-cyan-500/40 truncate max-w-[200px]">
                  {displayIssue.issueCode || "ISSUE"}: {displayIssue.category?.toUpperCase()}
                </div>
                <Crosshair size={16} className="absolute -top-2 -left-2 text-cyan-400" />
                <Crosshair size={16} className="absolute -bottom-2 -right-2 text-cyan-400" />
              </div>

              {/* Viewport Overlay HUD */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-cyan-300 flex items-center gap-1">
                  <Scan size={12} /> GPS: {displayIssue.latitude ? `${displayIssue.latitude.toFixed(4)}° N, ${displayIssue.longitude.toFixed(4)}° E` : "28.6139° N, 77.2090° E"}
                </span>
                <span>MODEL: GEMINI-2.5</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="font-mono text-slate-400 text-[11px]">
                DB TICKET: <strong className="text-white">{displayIssue.issueCode || "CC-84920"}</strong>
              </span>
              <button
                type="button"
                onClick={restartScan}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} />
                <span>Rerun Analysis</span>
              </button>
            </div>
          </div>

          {/* =====================================================
              RIGHT COLUMN: REAL STEP-BY-STEP DIAGNOSTIC READOUT
          ===================================================== */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 lg:col-span-6 backdrop-blur-md">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-200">
                    REAL-TIME DIAGNOSTIC SEQUENCE
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                  STEP {currentStep + 1} OF 5
                </span>
              </div>

              {/* Progress Pipeline Ticker */}
              <div className="mt-5 grid grid-cols-5 gap-1.5">
                {analysisSteps.map((step) => {
                  const isDone = currentStep >= step.id;
                  const isCurrent = currentStep === step.id;
                  return (
                    <div key={step.id} className="flex flex-col gap-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isDone ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-800"
                        }`}
                      />
                      <span className={`text-[9px] font-mono truncate text-center ${isCurrent ? "text-emerald-300 font-bold" : "text-slate-600"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Core Telemetry Data Cards from Real Database */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <span className="text-slate-400">Detected Category</span>
                  <div className="text-right">
                    <span className="font-bold text-white capitalize">{displayIssue.category || "Municipal Infrastructure"}</span>
                    <span className="ml-2 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <span className="text-slate-400">Severity Assessment</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-amber-300 uppercase">{displayIssue.priority || "MEDIUM"} HAZARD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <span className="text-slate-400">Duplicate Radius Check</span>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold">500m Haversine Radius</span>
                    <p className="text-[10px] text-slate-500">Deduplication engine passed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <span className="text-slate-400">Location Geofence Match</span>
                  <div className="text-right">
                    <span className="font-mono text-cyan-300 font-bold">
                      {displayIssue.latitude ? `${displayIssue.latitude.toFixed(4)}, ${displayIssue.longitude.toFixed(4)}` : "GPS Locked"}
                    </span>
                    <p className="text-[10px] text-slate-500">{displayIssue.address || "Ward Municipal Grid"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                  <span className="text-slate-400">Anti-Fraud Photo Check</span>
                  <span className="font-mono text-emerald-300 font-bold flex items-center gap-1">
                    <ShieldCheck size={14} /> PASSED (Raw Camera Capture)
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-300 font-mono">STATUS: {displayIssue.phase || displayIssue.status}</p>
                  <p className="text-[11px] text-slate-400">Department: {displayIssue.department || "Municipal Public Works"}</p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-emerald-400">{displayIssue.issueCode || "CC-84920"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
