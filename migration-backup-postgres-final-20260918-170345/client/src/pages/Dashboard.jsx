import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Inbox, Search, Users } from "lucide-react";
import { api } from "../api.js";
import { Link } from "react-router-dom";

const statCards = [
  ["new", "New", Inbox],
  ["inProgress", "In progress", Clock3],
  ["resolved", "Resolved", CheckCircle2],
  ["total", "Total", Users]
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    const [s, i] = await Promise.all([api.get("/officer/stats"), api.get("/officer/issues")]);
    setStats(s.data.stats);
    setIssues(i.data.issues);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => issues.filter(i => {
    const matchesFilter = !filter || i.status === filter;
    const q = query.toLowerCase();
    const matchesQuery = !q || `${i.title} ${i.category} ${i.issueCode}`.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  }), [issues, filter, query]);

  async function updateIssue(id, status) {
    await api.patch(`/officer/issues/${id}`, { status });
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div>
        <p className="font-bold text-emerald-700">Authority workspace</p>
        <h1 className="mt-2 text-4xl font-black">Officer dashboard</h1>
        <p className="mt-2 text-slate-500">Prioritize, assign and resolve citizen reports.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(([key, label, Icon]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">{label}</span><Icon size={19} className="text-emerald-700"/></div>
            <p className="mt-3 text-4xl font-black">{stats[key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={17}/>
            <input className="field pl-10" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search issue…" />
          </div>
          <select className="field md:w-48" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option><option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="divide-y">
          {filtered.map(issue => (
            <div key={issue._id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${issue.priority === "URGENT" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{issue.priority}</span>
                  <span className="text-xs text-slate-400">{issue.issueCode}</span>
                </div>
                <Link to={`/issues/${issue._id}`} className="mt-2 block font-extrabold hover:text-emerald-700">{issue.title}</Link>
                <p className="mt-1 text-sm text-slate-500">{issue.department} • {issue.location?.address || "Pinned location"} • {issue.upvotes || 0} supporters</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateIssue(issue._id, "IN_PROGRESS")} disabled={issue.status === "IN_PROGRESS"} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">Start</button>
                <button onClick={() => updateIssue(issue._id, "RESOLVED")} disabled={issue.status === "RESOLVED"} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
