import { CheckCircle2, Circle, XCircle, Clock, Search, ShieldCheck, Ban, AlertTriangle } from "lucide-react";

const PHASE_CONFIG = [
  { key: "NEW", label: "Reported", Icon: Circle, color: "bg-blue-500" },
  { key: "IN_PROGRESS", label: "In Progress", Icon: Clock, color: "bg-amber-500" },
  { key: "RESOLUTION_REVIEW", label: "Resolution Review", Icon: Search, color: "bg-purple-500" },
  { key: "RESOLVED", label: "Resolved", Icon: ShieldCheck, color: "bg-emerald-500" },
  { key: "CLOSED", label: "Closed", Icon: CheckCircle2, color: "bg-slate-500" }
];

export default function StatusTimeline({ current, history = [], issue = null }) {
  const isRejected = current === "REJECTED";
  
  // Check if issue has active disputes
  const disputeEvent = [...history].reverse().find(h => h.status === "DISPUTED" || h.phase === "DISPUTED");
  const hasActiveDisputes = Boolean(
    disputeEvent ||
    current === "DISPUTED" ||
    (issue && issue.citizenDisputes > 0 && issue.citizenDisputes > (issue.citizenConfirmations || 0))
  );

  // If disputed, the effective phase is IN_PROGRESS (reopened)
  const effectiveCurrent = hasActiveDisputes ? "IN_PROGRESS" : current;

  const currentIndex = isRejected
    ? -1
    : PHASE_CONFIG.findIndex(p => p.key === effectiveCurrent);

  return (
    <div className="space-y-1">
      {/* Rejected banner */}
      {isRejected && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500 text-white">
            <Ban size={18} />
          </div>
          <div>
            <p className="font-bold text-red-800">Issue Rejected</p>
            <p className="text-sm text-red-600">
              {[...history].reverse().find(h => h.phase === "REJECTED")?.remarks || "This issue was rejected by an officer."}
            </p>
          </div>
        </div>
      )}

      {/* Community Dispute Banner */}
      {hasActiveDisputes && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-2xs">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-600 text-white animate-pulse">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="font-bold text-rose-900 flex items-center gap-1.5">
              <span>Resolution Disputed by Community</span>
              <span className="text-[11px] font-mono bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                REOPENED
              </span>
            </p>
            <p className="text-xs text-rose-700 mt-0.5">
              {disputeEvent?.remarks || "3 citizen disputes received. Marked for supervisor and field re-inspection."}
            </p>
          </div>
        </div>
      )}

      {/* Normal phase timeline */}
      {PHASE_CONFIG.map((phase, index) => {
        const reached = !isRejected && index <= currentIndex;
        const isCurrent = !isRejected && phase.key === effectiveCurrent;
        
        // Find corresponding event in history
        const event = [...history].reverse().find(h => h.phase === phase.key || h.status === phase.key);
        const Icon = phase.Icon;

        // If this is the resolved step but currently disputed, highlight it specially
        const isDisputedResolvedStep = phase.key === "RESOLVED" && hasActiveDisputes;

        return (
          <div key={phase.key} className="flex gap-4">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black transition-all duration-300 ${
                  isDisputedResolvedStep
                    ? "bg-rose-100 border-2 border-rose-400 text-rose-600"
                    : reached
                    ? `${phase.color} text-white shadow-md ${isCurrent ? "ring-4 ring-offset-2 ring-emerald-200 scale-110" : ""}`
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDisputedResolvedStep ? (
                  <AlertTriangle size={16} className="text-rose-600" />
                ) : reached ? (
                  <Icon size={16} />
                ) : (
                  index + 1
                )}
              </div>
              {index < PHASE_CONFIG.length - 1 && (
                <div
                  className={`mt-1 h-8 w-0.5 transition-colors duration-300 ${
                    index < currentIndex ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>

            {/* Label + info */}
            <div className="pb-4">
              <p className={`font-bold ${isDisputedResolvedStep ? "text-rose-700" : reached ? "text-slate-900" : "text-slate-400"}`}>
                {phase.label}
                {isDisputedResolvedStep && (
                  <span className="ml-2 text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Contested
                  </span>
                )}
              </p>
              {isDisputedResolvedStep ? (
                <div>
                  <p className="text-sm text-rose-600 font-medium">
                    Fix rejected by neighborhood peer review
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Reopened in triage
                  </p>
                </div>
              ) : event ? (
                <div>
                  <p className="text-sm text-slate-500">
                    {event.remarks || "Completed"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {event.changedBy?.name && `by ${event.changedBy.name} • `}
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  {reached ? "Completed" : "Waiting"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
