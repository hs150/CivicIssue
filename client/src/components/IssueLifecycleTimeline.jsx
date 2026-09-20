import { useState, useEffect } from "react";
import { Check, MapPin, AlertCircle } from "lucide-react";
import { api } from "../api.js";
import { getImageUrl } from "../utils/image.js";

export default function IssueLifecycleTimeline() {
  const [issues, setIssues] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [issueDetail, setIssueDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real issues list
  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          setIssues(data.issues);
          setSelectedId(data.issues[0].id);
        }
      } catch (err) {
        console.error("Failed to load issues for lifecycle:", err);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch real issue details & history
  useEffect(() => {
    if (!selectedId) return;
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      try {
        const { data } = await api.get(`/issues/${selectedId}`);
        if (isMounted && data?.issue) {
          setIssueDetail(data.issue);
          setHistory(Array.isArray(data.history) ? data.history : []);
        }
      } catch (err) {
        console.error("Failed to load issue history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isMounted = false; };
  }, [selectedId]);

  const issue = issueDetail || issues[0] || {};

  // Build real chronological steps from database history
  const formatDate = (iso) => {
    if (!iso) return "Recorded";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  const timelineSteps = history.length > 0
    ? history.map((h, idx) => ({
        id: h.id || idx,
        title: (h.phase || h.status || "UPDATE").replace(/_/g, " "),
        timestamp: formatDate(h.createdAt),
        desc: h.remarks || (idx === 0 ? "Issue reported by citizen" : `Status updated to ${h.phase}`),
        actor: h.changedBy?.name || (idx === 0 ? issue.reporter?.name || "Citizen" : "Municipal Officer")
      }))
    : [
        {
          id: "submitted",
          title: "Submitted",
          timestamp: formatDate(issue.createdAt),
          desc: "Issue reported by citizen",
          actor: issue.reporter?.name || "Citizen"
        },
        {
          id: "assigned",
          title: "Assigned",
          timestamp: formatDate(issue.updatedAt),
          desc: `Assigned to ${issue.assignedOfficer?.name || "Municipal Corporation"}`,
          actor: "System"
        }
      ];

  const photoSrc = getImageUrl(issue.resolutionImageUrl || issue.imageUrl);

  const detailsRows = [
    { label: "Category", value: issue.category ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : "General" },
    { label: "Priority", value: issue.priority ? issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1).toLowerCase() : "Medium" },
    { label: "Department", value: issue.department || "Municipal Public Works" },
    { label: "Assigned To", value: issue.assignedOfficer?.name || "Road Maintenance Team" },
    { label: "Reported On", value: formatDate(issue.createdAt) },
    { label: "Resolved On", value: issue.resolvedAt ? formatDate(issue.resolvedAt) : (issue.phase === "RESOLVED" ? formatDate(issue.updatedAt) : "In Progress") }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
            Track an Issue
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Follow the complete lifecycle of a civic issue.
          </p>
        </div>

        {/* Real Issue Selector / Tag */}
        <div className="flex items-center gap-2">
          {issues.length > 1 && (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#07111F] focus:outline-none"
            >
              {issues.map(i => (
                <option key={i.id} value={i.id}>
                  #{i.issueCode || i.id.slice(0, 8)} — {i.title}
                </option>
              ))}
            </select>
          )}

          <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-mono shadow-2xs">
            <span className="font-semibold text-[#07111F]">#{issue.issueCode || "CC-46655614"}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              issue.phase === "RESOLVED"
                ? "bg-emerald-50 text-[#00A881] border-emerald-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}>
              {issue.phase || issue.status || "IN_PROGRESS"}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Left = Timeline, Right = Issue Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Real History Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 pt-2">
          <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-[#00A881]">
            {timelineSteps.map((step, idx) => (
              <div key={step.id || idx} className="relative flex items-start gap-4">
                
                {/* Green Circle Checkmark */}
                <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00A881] text-white shadow-xs">
                  <Check size={11} strokeWidth={3.5} />
                </div>

                {/* Step Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="text-sm font-bold text-[#07111F] capitalize">
                      {step.title}
                    </h4>
                    <span className="text-xs text-[#94A3B8] font-medium">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Real Issue Card with Image & Details Table (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          
          {/* Photo with After/Before Tag */}
          <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={issue.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-xs font-mono">No Photo Available</div>
            )}
            
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#00A881] border border-emerald-200 backdrop-blur-md">
                <Check size={10} strokeWidth={3} />
                <span>{issue.resolutionImageUrl ? "Proof of Fix" : "Verified Issue"}</span>
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5">
            <h3 className="text-base font-bold text-[#07111F]">
              {issue.title || "Civic Incident"}
            </h3>
            
            <p className="mt-1 text-xs text-[#64748B] flex items-center gap-1">
              <MapPin size={12} className="text-[#94A3B8]" />
              <span>{issue.address || (issue.latitude ? `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}` : "GPS Logged")}</span>
            </p>

            {/* Key-Value Details Table */}
            <div className="mt-4 divide-y divide-[#F1F5F9] border-t border-[#F1F5F9] text-xs">
              {detailsRows.map((row) => (
                <div key={row.label} className="py-2 flex items-center justify-between">
                  <span className="text-[#94A3B8]">{row.label}</span>
                  <span className="font-semibold text-[#07111F]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
