import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, MessageCircle, ThumbsUp, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getImageUrl } from "../utils/image.js";

const phaseStyle = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  RESOLUTION_REVIEW: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  RESOLVED: "bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 font-bold",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  DISPUTED: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 font-black"
};

const priorityStyle = {
  LOW: "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-neutral-800",
  MEDIUM: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40",
  HIGH: "text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/40",
  URGENT: "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 font-bold"
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-black dark:hover:border-white"
    >
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
        {issue.imageUrl ? (
          <img
            src={getImageUrl(issue.imageUrl)}
            alt={issue.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-5xl">
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
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/90 dark:bg-white/90 px-2 py-0.5 text-[10px] font-bold text-white dark:text-black backdrop-blur-md border border-white/20 dark:border-black/20 shadow-md">
              <ShieldCheck size={11} className="text-white dark:text-black" /> AI Fix Verified
            </span>
          )}
          {!hasAIVerification && hasAIScan && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/80 dark:bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-neutral-200 backdrop-blur-md border border-white/20 shadow-md">
              <Sparkles size={11} className="text-white" /> AI Scanned
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{issue.issueCode || "CC-ISSUE"}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {CATEGORY_ICONS[issue.category?.toUpperCase()]} {issue.category || "General"}
          </span>
        </div>

        <h3 className="line-clamp-1 text-base font-extrabold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
          {issue.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-neutral-600 dark:text-neutral-400 flex-1">
          {issue.description}
        </p>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 truncate max-w-[170px]" title={issue.location?.address || issue.address}>
            <MapPin size={13} className="shrink-0 text-neutral-800 dark:text-neutral-200" />
            <span className="truncate">{issue.location?.address || issue.address || "Location pinned"}</span>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold transition active:scale-95 ${
                hasUpvoted
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
              title="Support this report"
            >
              <ThumbsUp size={13} className={hasUpvoted ? "fill-current" : ""} />
              <span>{upvotes}</span>
            </button>

            <span className="flex items-center gap-1 text-neutral-400">
              <MessageCircle size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
