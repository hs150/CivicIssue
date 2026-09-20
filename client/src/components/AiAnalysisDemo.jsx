import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, CheckCircle2, RefreshCw, Cpu, Crosshair, MapPin, Scan, Check } from "lucide-react";
import { api } from "../api.js";

export default function AiAnalysisDemo() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [verificationStage, setVerificationStage] = useState(4); // 0 to 4
  const [isScanning, setIsScanning] = useState(false);

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
        console.error("Failed to load issues for AI verification:", err);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  function runVerification() {
    setIsScanning(true);
    setVerificationStage(0);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setVerificationStage(stage);
      if (stage >= 4) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 600);
  }

  // Fallback issue if API is still resolving
  const currentIssue = selectedIssue || {
    id: "CC-46655614",
    issueCode: "CC-46655614",
    title: "Deep Pothole on Sector 4 Main Arterial Road",
    category: "Road Infrastructure",
    priority: "HIGH",
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: null,
    phase: "IN_PROGRESS",
    createdAt: new Date().toISOString()
  };

  const verificationItems = [
    {
      id: 0,
      title: "Damage detected",
      description: `${currentIssue.category || "Road Infrastructure"} hazard severity verified`,
      metric: "Pothole / Surface Degradation",
      isComplete: verificationStage >= 0
    },
    {
      id: 1,
      title: "Location verified",
      description: currentIssue.latitude 
        ? `${currentIssue.latitude.toFixed(4)}° N, ${currentIssue.longitude.toFixed(4)}° E within municipal geofence` 
        : "GPS telemetry locked within ward boundary",
      metric: "GIS Geofence Match",
      isComplete: verificationStage >= 1
    },
    {
      id: 2,
      title: "Timestamp valid",
      description: "EXIF metadata timestamp confirmed against server intake timestamp",
      metric: "Anti-Replay Passed",
      isComplete: verificationStage >= 2
    },
    {
      id: 3,
      title: "Duplicate check",
      description: "Haversine 500m scan found 0 conflicting active tickets",
      metric: "500m Radius Clean",
      isComplete: verificationStage >= 3
    }
  ];

  return (
    <section id="ai-verification" className="scroll-mt-24 py-20 bg-[#020817] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-mono font-bold text-[#00C896]">
              <Cpu size={13} className="text-[#00C896]" />
              <span>AI VERIFICATION ENGINE</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI doesn’t just analyze reports. <br className="hidden sm:inline" />
              <span className="text-[#00C896]">It verifies them.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              Every citizen report undergoes multimodal vision inspection, EXIF anti-tampering validation, and 500m spatial proximity deduplication before reaching municipal work orders.
            </p>
          </div>

          {/* Ticket Picker & Rerun Button */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            {issues.length > 0 && (
              <select
                value={currentIssue.id}
                onChange={(e) => {
                  const found = issues.find(i => i.id === e.target.value);
                  if (found) {
                    setSelectedIssue(found);
                    runVerification();
                  }
                }}
                className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-200 focus:border-[#00C896] focus:outline-none"
              >
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.issueCode || i.id.slice(0, 8)} — {i.title?.slice(0, 30)}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={runVerification}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 px-4 py-2.5 text-xs font-mono font-bold text-[#00C896] transition cursor-pointer"
            >
              <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
              <span>Re-scan</span>
            </button>
          </div>
        </div>

        {/* Large Split-Screen AI Verification Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* =========================================================
              LEFT COLUMN: SUBMITTED CIVIC EVIDENCE IMAGE / MAP
          ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm relative overflow-hidden">
            
            {/* Top Bar with Evidence Metadata */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-400">
                EVIDENCE FEED: <strong className="text-white">{currentIssue.issueCode || "CC-46655614"}</strong>
              </span>
              <span className="rounded bg-[#00C896]/10 px-2 py-0.5 text-[10px] font-bold text-[#00C896] border border-[#00C896]/30">
                LIVE CAPTURE
              </span>
            </div>

            {/* Evidence Image / Map Viewport */}
            <div className="relative aspect-4/3 w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800 mt-4 flex items-center justify-center">
              {currentIssue.imageUrl ? (
                <img
                  src={currentIssue.imageUrl.startsWith("http") ? currentIssue.imageUrl : `http://localhost:5000${currentIssue.imageUrl}`}
                  alt={currentIssue.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Procedural Satellite / Surface Grid Simulation */
                <div className="relative w-full h-full bg-[#030914] flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(#00C896 1px, transparent 1px), linear-gradient(90deg, #00C896 1px, transparent 1px)",
                      backgroundSize: "32px 32px"
                    }}
                  />
                  {/* Procedural Pothole / Road Fracture SVG Graphic */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <svg width="220" height="140" viewBox="0 0 220 140" fill="none" className="drop-shadow-[0_0_16px_rgba(239,68,68,0.4)]">
                      <path
                        d="M25 70 C40 35, 75 25, 115 30 C155 35, 190 50, 195 80 C200 110, 160 125, 120 120 C80 115, 20 105, 25 70 Z"
                        fill="#07111F"
                        stroke="#EF4444"
                        strokeWidth="2"
                      />
                      <path
                        d="M50 65 L85 80 M125 60 L155 85 M85 80 L125 90"
                        stroke="#F87171"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    </svg>
                    <span className="text-[10px] font-mono text-rose-400 mt-2 font-bold uppercase tracking-wider">
                      Surface Degradation Void [42cm Depth]
                    </span>
                  </div>
                </div>
              )}

              {/* Scanning Laser Beam Effect */}
              <div 
                className={`absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00C896] to-transparent shadow-[0_0_12px_#00C896] pointer-events-none ${
                  isScanning ? "animate-pulse" : ""
                }`}
                style={{
                  top: isScanning ? `${(verificationStage + 1) * 20}%` : "50%",
                  transition: "top 0.4s ease-out"
                }}
              />

              {/* Bounding Box HUD */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 rounded-lg border-2 border-[#00C896]/70 bg-[#00C896]/5 pointer-events-none">
                <div className="absolute -top-6 left-0 bg-slate-950/90 text-[#00C896] font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-[#00C896]/40 truncate max-w-[200px]">
                  IDENTIFIED: {currentIssue.category?.toUpperCase() || "ROAD HAZARD"}
                </div>
                <Crosshair size={14} className="absolute -top-1.5 -left-1.5 text-[#00C896]" />
                <Crosshair size={14} className="absolute -bottom-1.5 -right-1.5 text-[#00C896]" />
              </div>

              {/* Viewport Bottom Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="flex items-center gap-1">
                  <Scan size={12} className="text-[#00C896]" />
                  <span>GPS: {currentIssue.latitude ? `${currentIssue.latitude.toFixed(4)}° N, ${currentIssue.longitude.toFixed(4)}° E` : "28.6139° N, 77.2090° E"}</span>
                </span>
                <span className="text-[#00C896] font-bold">100% AUDITABLE</span>
              </div>
            </div>

            {/* Bottom Issue Title & Coordinates */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-white truncate max-w-[280px]">
                {currentIssue.title}
              </span>
              <span className="font-mono text-[11px] text-[#64748B]">
                {currentIssue.priority || "HIGH"} PRIORITY
              </span>
            </div>

          </div>

          {/* =========================================================
              RIGHT COLUMN: AI EVIDENCE ANALYSIS PANEL
          ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 backdrop-blur-sm">
            <div>
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00C896]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    AI Evidence Analysis Panel
                  </span>
                </div>
                <span className="rounded-full bg-[#00C896]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#00C896] border border-[#00C896]/20">
                  {verificationStage >= 4 ? "4/4 CHECKS PASSED" : `STEP ${verificationStage + 1} OF 4`}
                </span>
              </div>

              {/* The 4 Check Items (Damage detected ✓, Location verified ✓, Timestamp valid ✓, Duplicate check ✓) */}
              <div className="mt-6 space-y-3">
                {verificationItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between rounded-xl border p-4 transition-all duration-300 ${
                      item.isComplete
                        ? "border-slate-800 bg-slate-950/70"
                        : "border-slate-800/40 bg-slate-950/20 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          item.isComplete
                            ? "bg-[#00C896] text-[#020817]"
                            : "border border-slate-700 text-slate-500"
                        }`}
                      >
                        {item.isComplete ? <Check size={13} strokeWidth={3} /> : item.id + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white tracking-wide">
                            {item.title} {item.isComplete && <span className="text-[#00C896]">✓</span>}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {item.metric}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* TRUST SCORE: 98.7% (As requested by prompt) */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="rounded-xl border border-[#00C896]/40 bg-gradient-to-br from-[#00C896]/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#00C896] text-[#020817] font-black">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#00C896] uppercase tracking-wider">
                        Consensus Verdict
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Verified for immediate municipal field unit dispatch
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <span className="text-[11px] text-slate-400 block uppercase">Trust Score</span>
                  <span className="text-2xl font-black text-[#00C896] tracking-tight">
                    98.7%
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
