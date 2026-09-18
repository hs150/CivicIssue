import { CheckCircle2, Circle, XCircle, Clock, Search, ShieldCheck, Ban } from "lucide-react";

const PHASE_CONFIG = [
  { key: "NEW", label: "Reported", Icon: Circle, color: "bg-blue-500" },
  { key: "IN_PROGRESS", label: "In Progress", Icon: Clock, color: "bg-amber-500" },
  { key: "RESOLUTION_REVIEW", label: "Resolution Review", Icon: Search, color: "bg-purple-500" },
  { key: "RESOLVED", label: "Resolved", Icon: ShieldCheck, color: "bg-emerald-500" },
  { key: "CLOSED", label: "Closed", Icon: CheckCircle2, color: "bg-slate-500" }
];

export default function StatusTimeline({ current, history = [] }) {
  const isRejected = current === "REJECTED";

  const currentIndex = isRejected
    ? -1
    : PHASE_CONFIG.findIndex(p => p.key === current);

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

      {/* Normal phase timeline */}
      {PHASE_CONFIG.map((phase, index) => {
        const reached = !isRejected && index <= currentIndex;
        const isCurrent = !isRejected && phase.key === current;
        const event = [...history].reverse().find(h => h.phase === phase.key || h.status === phase.key);
        const Icon = phase.Icon;

        return (
          <div key={phase.key} className="flex gap-4">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black transition-all duration-300 ${
                  reached
                    ? `${phase.color} text-white shadow-md ${isCurrent ? "ring-4 ring-offset-2 ring-emerald-200 scale-110" : ""}`
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {reached ? <Icon size={16} /> : index + 1}
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
              <p className={`font-bold ${reached ? "text-slate-900" : "text-slate-400"}`}>
                {phase.label}
              </p>
              {event ? (
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
