import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight, AlertTriangle, Plus } from "lucide-react";
import { api } from "../api.js";
import { getImageUrl } from "../utils/image.js";

const PRIORITY_BADGES = {
  URGENT: { bg: "bg-rose-50 text-[#EF4444] border-rose-200", dot: "bg-[#EF4444]" },
  HIGH: { bg: "bg-rose-50 text-[#EF4444] border-rose-200", dot: "bg-[#EF4444]" },
  MEDIUM: { bg: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
  LOW: { bg: "bg-emerald-50 text-[#00A881] border-emerald-200", dot: "bg-[#00A881]" }
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
            Recent Issues
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            See what's happening in your city.
          </p>
        </div>

        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#07111F] hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
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
              className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs hover:border-[#00A881]/50 hover:shadow-md transition-all"
            >
              <div>
                {/* Real Issue Image */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
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
                    className="h-full w-full flex-col items-center justify-center text-slate-400 gap-1 p-4 text-center bg-slate-100"
                  >
                    <AlertTriangle size={24} className="text-[#00A881]" />
                    <span className="text-[10px] font-mono">No Photo Uploaded</span>
                  </div>
                  
                  {/* Priority Tag Pill on top right */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border backdrop-blur-md bg-white/90 ${badge.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      <span>{issue.priority || "MEDIUM"}</span>
                    </span>
                  </div>
                </div>

                {/* Title & Location */}
                <div className="p-4 pb-2">
                  <h3 className="text-sm font-bold text-[#07111F] group-hover:text-[#00A881] transition line-clamp-1" title={issue.title}>
                    {issue.title}
                  </h3>
                  
                  <p className="mt-1 text-xs text-[#64748B] flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-[#94A3B8] shrink-0" />
                    <span>{issue.address || (issue.latitude ? `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}` : "GPS Logged")}</span>
                  </p>

                  <p className="mt-1 text-[11px] text-[#94A3B8] flex items-center gap-1">
                    <Clock size={11} />
                    <span>{getTimeAgo(issue.createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Footer: Category & Code */}
              <div className="px-4 py-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-[#64748B] capitalize">
                  {issue.category || "General"}
                </span>
                <span className="text-[11px] font-semibold text-[#94A3B8]">
                  #{issue.issueCode || issue.id.slice(0, 8)}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Report New Issue Card */}
        <Link
          to="/report"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white/60 p-6 text-center hover:border-[#00A881] hover:bg-emerald-50/30 transition-all group min-h-[260px]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#00A881] group-hover:scale-110 transition-transform">
            <Plus size={22} strokeWidth={2.5} />
          </div>
          <h4 className="mt-3 text-sm font-bold text-[#07111F] group-hover:text-[#00A881] transition">
            Report an Issue
          </h4>
          <p className="mt-1 text-xs text-[#64748B] max-w-[200px]">
            Spot a pothole, broken light, or waste problem in your area?
          </p>
        </Link>
      </div>

    </section>
  );
}
