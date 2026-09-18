const labels = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function StatusTimeline({ current, history = [] }) {
  const currentIndex = labels.indexOf(current);

  return (
    <div className="space-y-4">
      {labels.map((status, index) => {
        const reached = index <= currentIndex;
        const event = [...history].reverse().find(h => h.status === status);
        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black ${reached ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                {reached ? "✓" : index + 1}
              </div>
              {index < labels.length - 1 && <div className={`mt-1 h-9 w-0.5 ${index < currentIndex ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </div>
            <div className="pb-5">
              <p className={`font-bold ${reached ? "text-slate-900" : "text-slate-400"}`}>{status.replace("_", " ")}</p>
              <p className="text-sm text-slate-500">{event?.remarks || (reached ? "Completed" : "Waiting")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
