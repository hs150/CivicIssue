import { useState, useEffect, useRef } from "react";
import { 
  FileText, ShieldCheck, UserCheck, Wrench, Sparkles, 
  CheckCircle2, Clock, ArrowRight, Shield, Activity
} from "lucide-react";

const LIFECYCLE_STAGES = [
  {
    id: "report",
    num: "01",
    label: "Report",
    timestamp: "10:32:14",
    elapsed: "T+00m",
    status: "Citizen Ingest",
    icon: FileText,
    actor: "Citizen #8192",
    details: "Geo-tagged photo submitted at Sector 4 Main Crossway. Mobile sensor telemetry logged.",
    telemetry: {
      location: "28.6139° N, 77.2090° E",
      source: "Citizen PWA Camera",
      hash: "SHA256: e8b9...4201"
    }
  },
  {
    id: "ai_verify",
    num: "02",
    label: "AI Verified",
    timestamp: "10:33:02",
    elapsed: "+48s",
    status: "Neural Scan",
    icon: Sparkles,
    actor: "Gemini Vision Multi-modal",
    details: "Multimodal inspection confirmed Pothole Severity Index 4.5/5. Proximity deduplication verified distinct.",
    telemetry: {
      confidence: "98.4%",
      duplicateRisk: "0.8%",
      routingTag: "PWD_ROADWAYS_DIV_3"
    }
  },
  {
    id: "assigned",
    num: "03",
    label: "Assigned",
    timestamp: "10:41:20",
    elapsed: "+8m 18s",
    status: "Unit Dispatched",
    icon: UserCheck,
    actor: "Officer R. Verma (Unit 04)",
    details: "TSP route optimizer dynamically updated field queue. High-priority dispatch acknowledge beacon received.",
    telemetry: {
      eta: "14 Minutes",
      priority: "CRITICAL-A",
      crewSize: "4 Technicians"
    }
  },
  {
    id: "fixed",
    num: "04",
    label: "Fixed",
    timestamp: "13:12:45",
    elapsed: "+2h 31m",
    status: "Repairs Complete",
    icon: Wrench,
    actor: "Municipal Fast-Response Crew",
    details: "Cold-mix asphalt compaction and road leveling completed. Field evidence photos uploaded via Officer Desk.",
    telemetry: {
      materials: "Grade-A Bitumen Composite",
      workOrder: "WO-99214-DEL",
      tempCured: "True"
    }
  },
  {
    id: "reverify",
    num: "05",
    label: "Re-Verified",
    timestamp: "13:15:10",
    elapsed: "+2m 25s",
    status: "Anti-Fraud Check",
    icon: ShieldCheck,
    actor: "AI Verification Engine",
    details: "Multimodal Gemini comparison between Before and After imagery. 99.1% background landmark match confirmed legitimate.",
    telemetry: {
      landmarkMatch: "99.1% Match",
      antiFraudStatus: "PASSED",
      geoDrift: "< 1.2 meters"
    }
  },
  {
    id: "resolved",
    num: "06",
    label: "Resolved",
    timestamp: "13:16:00",
    elapsed: "+50s",
    status: "Public Ledger",
    icon: CheckCircle2,
    actor: "Civic Ledger System",
    details: "Ticket permanently sealed. Citizen SMS notification sent, municipal performance KPI updated, ward audit closed.",
    telemetry: {
      turnaroundTotal: "2h 43m 46s",
      auditStatus: "IMMUTABLE_LOGGED",
      citizenNotified: "Delivered (SMS/App)"
    }
  }
];

export default function IssueLifecycleTimeline() {
  const [activeStageIndex, setActiveStageIndex] = useState(5);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const selectedStage = LIFECYCLE_STAGES[activeStageIndex];

  return (
    <section ref={sectionRef} className="relative py-20 bg-white border-y border-slate-200/80 overflow-hidden">
      {/* Background subtle technical grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity size={14} className="text-emerald-600 animate-pulse" />
              Automated Accountability
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              End-to-End Issue Lifecycle
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Every civic ticket follows a cryptographically logged, AI-validated pipeline from citizen intake to physical resolution and final anti-fraud verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-900">Audit Trail:</span> Immutably Stored
            </div>
          </div>
        </div>

        {/* Horizontal Progress Timeline */}
        <div className="mt-12">
          {/* Timeline Bar & Nodes */}
          <div className="relative py-8">
            {/* Base Background Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-200 rounded-full hidden md:block" />

            {/* Active Progress Fill Line (Animated on InView) */}
            <div 
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out hidden md:block"
              style={{
                width: inView ? `${(activeStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%` : "0%"
              }}
            />

            {/* Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 relative z-10">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                const isFinalResolved = idx === 5;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageIndex(idx)}
                    className="flex flex-col items-center text-center group focus:outline-none transition-all duration-200"
                  >
                    {/* Timestamp Pill above node */}
                    <div className={`mb-3 text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all duration-300 ${
                      isCurrent
                        ? "bg-slate-900 text-emerald-400 border-slate-800 shadow-sm"
                        : isPassed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {stage.timestamp}
                    </div>

                    {/* Node Circle */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isCurrent
                        ? "bg-emerald-600 text-white scale-110 ring-4 ring-emerald-500/25 shadow-emerald-600/30"
                        : isPassed
                        ? "bg-slate-900 text-emerald-400 hover:scale-105"
                        : "bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300"
                    }`}>
                      {isFinalResolved && isPassed ? (
                        <CheckCircle2 size={22} className="text-emerald-400" />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>

                    {/* Label & Elapsed Tag */}
                    <div className="mt-3">
                      <p className={`text-xs font-bold transition-colors ${
                        isCurrent ? "text-emerald-700" : isPassed ? "text-slate-900" : "text-slate-400"
                      }`}>
                        {stage.label}
                      </p>
                      <span className="text-[10px] font-mono font-medium text-slate-400 block mt-0.5">
                        {stage.elapsed}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Telemetry Card for Selected Stage */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:p-8 backdrop-blur-xs transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  STEP {selectedStage.num} OF 06
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Actor: <strong className="text-slate-800">{selectedStage.actor}</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                {selectedStage.label} — {selectedStage.status}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedStage.details}
              </p>
            </div>

            {/* Diagnostic Key-Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {Object.entries(selectedStage.telemetry).map(([key, val]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accountability Guarantee Footnote */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-600" />
            <span>Cryptographic audit proof available for all public tickets under Freedom of Information compliance.</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Avg Cycle Duration: 2 Hours 43 Minutes
          </div>
        </div>
      </div>
    </section>
  );
}
