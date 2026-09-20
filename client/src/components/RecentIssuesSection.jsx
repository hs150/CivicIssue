import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, AlertTriangle, Plus } from "lucide-react";
import { api } from "../api.js";
import { getImageUrl } from "../utils/image.js";

const PRIORITY_BADGES = {
  URGENT: { bg: "bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] border-rose-200 dark:border-rose-900/50", dot: "bg-[#EF4444]" },
  HIGH: { bg: "bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] border-rose-200 dark:border-rose-900/50", dot: "bg-[#EF4444]" },
  MEDIUM: { bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50", dot: "bg-amber-500" },
  LOW: { bg: "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700", dot: "bg-neutral-900 dark:bg-white" }
};

export default function RecentIssuesSection() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues)) {
          setIssues(data.issues);
        }
      } catch (err) {
        console.error("Failed to load real issues:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs < 24) return `${diffHrs} hours ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Recent Issues
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            See what's happening in your city.
          </p>
        </div>

        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black px-4 py-2 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-2xs"
        >
          <span>View All Issues</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Real Issues Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {issues.map((issue) => {
          const priorityKey = (issue.priority || "MEDIUM").toUpperCase();
          const badge = PRIORITY_BADGES[priorityKey] || PRIORITY_BADGES.MEDIUM;
          const imgSrc = getImageUrl(issue.imageUrl);

          return (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden shadow-xs hover:border-black dark:hover:border-white hover:shadow-md transition-all"
            >
              <div>
                {/* Real Issue Image */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={issue.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: imgSrc ? "none" : "flex" }}
                    className="h-full w-full flex-col items-center justify-center text-neutral-400 gap-1 p-4 text-center bg-neutral-100 dark:bg-neutral-900"
                  >
                    <AlertTriangle size={24} className="text-neutral-400" />
                    <span className="text-[10px] font-mono">No Photo Uploaded</span>
                  </div>
                  
                  {/* Priority Tag Pill on top right */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border backdrop-blur-md bg-white/90 dark:bg-black/90 ${badge.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span>{issue.priority || "MEDIUM"}</span>
                    </span>
                  </div>
                </div>

                {/* Title & Location */}
                <div className="p-4 pb-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:underline transition line-clamp-1" title={issue.title}>
                    {issue.title}
                  </h3>
                  
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-neutral-400 shrink-0" />
                    <span>{issue.address || (issue.latitude ? `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}` : "GPS Logged")}</span>
                  </p>

                  <p className="mt-1 text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{getTimeAgo(issue.createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Footer: Category & Code */}
              <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                <span className="rounded bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 capitalize">
                  {issue.category || "General"}
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  #{issue.issueCode || issue.id.slice(0, 8)}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Report New Issue Card */}
        <Link
          to="/report"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-black/60 p-6 text-center hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group min-h-[260px]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white group-hover:scale-110 transition-transform">
            <Plus size={22} strokeWidth={2.5} />
          </div>
          <h4 className="mt-3 text-sm font-bold text-neutral-900 dark:text-white group-hover:underline transition">
            Report an Issue
          </h4>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-[200px]">
            Spot a pothole, broken light, or waste problem in your area?
          </p>
        </Link>
      </div>

    </section>
  );
}
