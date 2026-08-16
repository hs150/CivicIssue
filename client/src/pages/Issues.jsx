import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "../api.js";
import IssueCard from "../components/IssueCard.jsx";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/issues", { params: { search, status } });
      setIssues(data.issues);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [status]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-bold text-emerald-700">Community feed</p>
          <h1 className="mt-2 text-4xl font-black">Explore civic issues</h1>
          <p className="mt-2 text-slate-500">See what people are reporting and supporting.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18}/>
            <input className="field pl-10" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} />
          </div>
          <select className="field" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button onClick={load} className="grid place-items-center rounded-xl border border-slate-300 px-4"><SlidersHorizontal size={18}/></button>
        </div>
      </div>

      {loading ? <div className="py-20 text-center text-slate-500">Loading issues…</div> :
        issues.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {issues.map(issue => <IssueCard key={issue._id} issue={issue}/>)}
          </div>
        ) : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">No issues found.</div>
      }
    </div>
  );
}
