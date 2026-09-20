import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, MessageCircle, ThumbsUp, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const phaseStyle = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLUTION_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  DISPUTED: "bg-rose-100 text-rose-800 border-rose-300 font-black"
};

const priorityStyle = {
  LOW: "text-slate-500 bg-slate-100",
  MEDIUM: "text-blue-700 bg-blue-50",
  HIGH: "text-orange-700 bg-orange-50",
  URGENT: "text-rose-700 bg-rose-50"
};

const CATEGORY_ICONS = {
  ROAD: "🛣️",
  GARBAGE: "🗑️",
  STREETLIGHT: "💡",
  WATER: "🚰",
  DRAINAGE: "🌊",
  ELECTRICITY: "⚡",
  TRAFFIC: "🚦",
  PUBLIC_SAFETY: "🚨",
  PARK: "🌳",
  SANITATION: "🧹",
  OTHER: "📍"
};

export default function IssueCard({ issue }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(issue.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const isDisputed = Boolean(
    issue.status === "DISPUTED" ||
    (issue.citizenDisputes > 0 && issue.citizenDisputes > (issue.citizenConfirmations || 0))
  );

  const rawPhase = issue.phase || issue.status || "NEW";
  const phase = isDisputed ? "DISPUTED" : rawPhase;
  const priority = issue.priority || "MEDIUM";
  const hasAIVerification = Boolean(issue.fixVerification?.verified);
  const hasAIScan = Boolean(issue.aiAnalysis || issue.aiConfidence);

  async function handleUpvote(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please login to support civic issues");
      return navigate("/login");
    }

    if (upvoting || hasUpvoted) return;

    setUpvoting(true);
    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);

    try {
      await api.post(`/issues/${issue._id || issue.id}/upvote`);
      toast.success("Supported issue! 👍");
    } catch (err) {
      // Revert if error
      setUpvotes((prev) => Math.max(0, prev - 1));
      setHasUpvoted(false);
      toast.error(err.response?.data?.message || "Could not record support");
    } finally {
      setUpvoting(false);
    }
  }

  return (
    <Link
      to={`/issues/${issue._id || issue.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200/80"
    >
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-100 to-teal-50 text-5xl">
            {CATEGORY_ICONS[issue.category?.toUpperCase()] || "🏙️"}
          </div>
        )}

        {/* Phase Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs backdrop-blur-md ${
              phaseStyle[phase] || phaseStyle.NEW
            }`}
          >
            {isDisputed ? `⚠ DISPUTED (${issue.citizenDisputes})` : phase.replace(/_/g, " ")}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
              priorityStyle[priority] || priorityStyle.MEDIUM
            }`}
          >
            {priority}
          </span>
        </div>

        {/* AI Badges Floating Bottom-Left */}
        <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5">
          {hasAIVerification && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/85 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md border border-emerald-500/30 shadow-md">
              <ShieldCheck size={11} className="text-emerald-400" /> AI Fix Verified
            </span>
          )}
          {!hasAIVerification && hasAIScan && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold text-teal-300 backdrop-blur-md border border-teal-500/30 shadow-md">
              <Sparkles size={11} className="text-teal-400" /> CIVICORA Scanned
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">{issue.issueCode || "CC-ISSUE"}</span>
          <span className="font-semibold text-slate-600">
            {CATEGORY_ICONS[issue.category?.toUpperCase()]} {issue.category || "General"}
          </span>
        </div>

        <h3 className="line-clamp-1 text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
          {issue.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 flex-1">
          {issue.description}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-500 truncate max-w-[170px]" title={issue.location?.address || issue.address}>
            <MapPin size={13} className="shrink-0 text-emerald-600" />
            <span className="truncate">{issue.location?.address || issue.address || "Location pinned"}</span>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 font-bold transition active:scale-95 ${
                hasUpvoted
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
              title="Support this report"
            >
              <ThumbsUp size={13} className={hasUpvoted ? "fill-emerald-700 text-emerald-700" : ""} />
              <span>{upvotes}</span>
            </button>

            <span className="flex items-center gap-1 text-slate-400">
              <MessageCircle size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
