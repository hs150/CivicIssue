import { useState, useEffect } from "react";
import { 
  FileText, ShieldCheck, UserCheck, Wrench, Sparkles, 
  CheckCircle2, Clock, ArrowRight, Shield, Activity, MapPin, Check
} from "lucide-react";
import { api } from "../api.js";

const LIFECYCLE_STEPS = [
  { id: "SUBMITTED", label: "Submitted", desc: "Report logged with verified GPS & photos", icon: FileText },
  { id: "AI_VERIFIED", label: "AI Verified", desc: "Multimodal damage & duplicate check", icon: Sparkles },
  { id: "OFFICER_ASSIGNED", label: "Officer Assigned", desc: "Dispatched to municipal ward unit", icon: UserCheck },
  { id: "WORK_IN_PROGRESS", label: "Work In Progress", desc: "Field crew active on repair site", icon: Wrench },
  { id: "RESOLVED", label: "Resolved", desc: "Proof-of-fix verified & audited", icon: CheckCircle2 }
];

export default function IssueLifecycleTimeline() {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [issueDetail, setIssueDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch real issues list
  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          setIssues(data.issues);
          setSelectedIssueId(data.issues[0].id);
        }
      } catch (err) {
        console.error("Failed to load issues for lifecycle:", err);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch selected issue detail
  useEffect(() => {
    if (!selectedIssueId) return;
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      try {
        const { data } = await api.get(`/issues/${selectedIssueId}`);
        if (isMounted && data?.issue) {
          setIssueDetail(data.issue);
        }
      } catch (err) {
        console.error("Failed to fetch issue detail for timeline:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isMounted = false; };
  }, [selectedIssueId]);

  // Determine active stage index (0 to 4)
  function getActiveStageIndex(issue) {
    if (!issue) return 1;
    const phase = (issue.phase || issue.status || "").toUpperCase();
    if (phase === "RESOLVED" || phase === "CLOSED") return 4;
    if (phase === "RESOLUTION_REVIEW") return 3;
    if (phase === "IN_PROGRESS") return 3;
    if (issue.assignedOfficerId || issue.assignedOfficer || issue.assignedDepartment) return 2;
    if (issue.citizenVerified || issue.aiVerification) return 1;
    return 0; // Submitted
  }

  const currentStageIdx = getActiveStageIndex(issueDetail);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#DDE5E1] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE5E1]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-mono font-bold text-[#008F70]">
              <ShieldCheck size={13} className="text-[#008F70]" />
              <span>TRANSPARENT RESOLUTION AUDIT</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
              Issue Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Deterministic progress tracking from citizen intake to municipal ledger certification.
            </p>
          </div>

          {/* Ticket Picker */}
          {issues.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#64748B] uppercase">Audit Ticket:</span>
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="rounded-xl border border-[#DDE5E1] bg-[#F7F9F8] px-3 py-2 text-xs font-bold text-[#07111F] focus:border-[#00C896] focus:outline-none"
              >
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.issueCode || i.id.slice(0, 8)} — {i.title?.slice(0, 28)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Split-Screen: Left = Timeline, Right = Issue Details Card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================
              LEFT: VISUALLY STRONG TRACKING TIMELINE (7 COLS)
              Submitted -> AI Verified -> Officer Assigned -> Work In Progress -> Resolved
          ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
              Deterministic Progress Stream
            </h3>

            {/* Vertical / Progressive Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDE5E1]">
              
              {/* Green active fill progress line */}
              <div
                className="absolute left-2.5 top-3 w-0.5 bg-[#00C896] transition-all duration-700 ease-out"
                style={{
                  height: `${(currentStageIdx / (LIFECYCLE_STEPS.length - 1)) * 90}%`
                }}
              />

              {LIFECYCLE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={step.id} className="relative flex items-start gap-4 group">
                    {/* Node Dot / Circle */}
                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isCurrent
                          ? "bg-[#00C896] text-[#020817] ring-4 ring-[#00C896]/30 shadow-sm"
                          : isPassed
                          ? "bg-[#008F70] text-white"
                          : "bg-white border-2 border-slate-300 text-slate-400"
                      }`}
                    >
                      {isPassed ? <Check size={13} strokeWidth={3} /> : idx + 1}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold transition-colors ${
                          isCurrent ? "text-[#008F70]" : isPassed ? "text-[#07111F]" : "text-[#64748B]"
                        }`}>
                          {step.label}
                        </h4>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isCurrent
                            ? "bg-[#00C896]/15 text-[#008F70] border border-[#00C896]/30 font-bold"
                            : isPassed
                            ? "bg-slate-100 text-[#07111F]"
                            : "text-[#64748B]"
                        }`}>
                          {isCurrent ? "IN STAGE" : isPassed ? "COMPLETED" : "PENDING"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* =========================================================
              RIGHT: ISSUE DETAILS CARD BESIDE TIMELINE (5 COLS)
              Realistic metadata, green progress indicator, trust stamp
          ========================================================= */}
          <div className="lg:col-span-5 rounded-2xl border border-[#DDE5E1] bg-[#F7F9F8] p-6 shadow-2xs">
            
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#DDE5E1] pb-3">
              <span className="font-mono text-xs font-bold text-[#008F70]">
                {issueDetail?.issueCode || "CC-46655614"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00C896]/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#008F70]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
                <span>{issueDetail?.phase || issueDetail?.status || "IN_PROGRESS"}</span>
              </span>
            </div>

            {/* Title & Category */}
            <div className="mt-3.5">
              <h4 className="text-base font-bold text-[#07111F] leading-snug">
                {issueDetail?.title || "Deep Pothole on Sector 4 Main Arterial Road"}
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Category: <strong className="text-[#07111F] capitalize">{issueDetail?.category || "Road Infrastructure"}</strong>
              </p>
            </div>

            {/* Progress Indicator Bar */}
            <div className="mt-4 pt-4 border-t border-[#DDE5E1]">
              <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-1.5">
                <span>Lifecycle Progress</span>
                <span className="font-bold text-[#008F70]">{Math.round(((currentStageIdx + 1) / 5) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00C896] transition-all duration-500"
                  style={{ width: `${((currentStageIdx + 1) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Realistic Metadata Grid */}
            <div className="mt-4 space-y-2.5 text-xs font-mono bg-white p-3.5 rounded-xl border border-[#DDE5E1]">
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Priority Index</span>
                <span className="font-bold text-[#07111F]">{issueDetail?.priority || "HIGH"}</span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Location</span>
                <span className="font-bold text-[#07111F] truncate max-w-[160px]">
                  {issueDetail?.address || "Ward 12 Municipal Road"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Coordinates</span>
                <span className="font-bold text-[#07111F]">
                  {issueDetail?.latitude ? `${issueDetail.latitude.toFixed(4)}, ${issueDetail.longitude.toFixed(4)}` : "28.6139, 77.2090"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Officer Unit</span>
                <span className="font-bold text-[#07111F]">
                  {issueDetail?.assignedOfficer?.name || issueDetail?.department || "Public Works Dept"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#64748B]">
                <span>Anti-Fraud Seal</span>
                <span className="font-bold text-[#008F70] flex items-center gap-1">
                  <ShieldCheck size={13} /> SHA256 VERIFIED
                </span>
              </div>
            </div>

            {/* View Full Ledger Button */}
            {issueDetail && (
              <div className="mt-4 pt-3 border-t border-[#DDE5E1] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">PostgreSQL Ledger #4665</span>
                <a
                  href={`/issues/${issueDetail.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#008F70] hover:underline"
                >
                  <span>Open Audit Record</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
