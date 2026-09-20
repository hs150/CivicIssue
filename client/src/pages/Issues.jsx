import { useEffect, useState, useCallback } from "react";
import { Search, LayoutGrid, Map as MapIcon, RotateCcw, Filter, Sparkles } from "lucide-react";
import { api } from "../api.js";
import IssueCard from "../components/IssueCard.jsx";
import CommunityMap from "../components/CommunityMap.jsx";

const CATEGORIES = [
  { id: "", label: "All", icon: "🌐" },
  { id: "ROAD", label: "Roads", icon: "🛣️" },
  { id: "GARBAGE", label: "Garbage", icon: "🗑️" },
  { id: "STREETLIGHT", label: "Lights", icon: "💡" },
  { id: "WATER", label: "Water", icon: "🚰" },
  { id: "DRAINAGE", label: "Drainage", icon: "🌊" },
  { id: "ELECTRICITY", label: "Power", icon: "⚡" },
  { id: "TRAFFIC", label: "Traffic", icon: "🚦" },
  { id: "PUBLIC_SAFETY", label: "Safety", icon: "🚨" },
  { id: "PARK", label: "Parks", icon: "🌳" }
];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "map"
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status) params.phase = status; // Phase-aware filtering
      if (category) params.category = category;

      const { data } = await api.get("/issues", { params });
      setIssues(data.issues || []);
    } catch (err) {
      console.error("Error loading issues:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, category]);

  useEffect(() => {
    load();
  }, [status, category]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setCategory("");
  };

  const hasActiveFilters = Boolean(search || status || category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-bold text-neutral-900 dark:text-white">
            <Sparkles size={12} /> Live Citizen Grid
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Explore Civic Issues
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Real-time public reports, geographic distribution, and AI-verified repairs across the city.
          </p>
        </div>

        {/* View Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "map"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <MapIcon size={14} /> Map View
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-3 text-neutral-400" size={16} />
            <input
              className="field pl-9 pr-3 py-2 text-sm"
              placeholder="Search code, title, street…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>

          {/* Status filter */}
          <select
            className="field py-2 text-sm w-full sm:w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Phases</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLUTION_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = category.toUpperCase() === cat.id;
          return (
            <button
              key={cat.id || "all"}
              onClick={() => setCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-md shadow-black/15"
                  : "border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <span>Showing {issues.length} {issues.length === 1 ? "issue" : "issues"}</span>
        {viewMode === "map" && <span className="text-neutral-900 dark:text-white font-bold">📍 Click any pin for report preview</span>}
      </div>

      {/* Main Content: Grid vs Map */}
      {loading ? (
        <div className="py-24 text-center text-sm font-medium text-neutral-400 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent"></div>
          <span>Loading civic reports…</span>
        </div>
      ) : issues.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold text-slate-800">No issues found</p>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search terms.</p>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <IssueCard key={issue._id || issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <CommunityMap issues={issues} height="600px" />
        </div>
      )}
    </div>
  );
}
