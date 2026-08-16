import { Link } from "react-router-dom";
import { MapPin, MessageCircle, ThumbsUp } from "lucide-react";

const statusStyle = {
  NEW: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700"
};

const priorityStyle = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600"
};

export default function IssueCard({ issue }) {
  return (
    <Link to={`/issues/${issue._id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {issue.imageUrl ? (
        <img src={issue.imageUrl} alt="" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-5xl">🏙️</div>
      )}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[issue.status] || statusStyle.NEW}`}>{issue.status.replace("_", " ")}</span>
          <span className={`text-xs font-bold ${priorityStyle[issue.priority] || priorityStyle.LOW}`}>{issue.priority}</span>
        </div>
        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900 group-hover:text-emerald-700">{issue.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{issue.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={14}/>{issue.location?.address || "Location pinned"}</span>
          <span className="flex items-center gap-1"><ThumbsUp size={14}/>{issue.upvotes || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={14}/>Comments</span>
        </div>
      </div>
    </Link>
  );
}
