import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import IssueCard from "../components/IssueCard.jsx";

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  useEffect(() => { api.get("/issues/mine").then(r => setIssues(r.data.issues)); }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Citizen Portal</p>
      <h1 className="mt-2 text-4xl font-black text-neutral-900 dark:text-white">My Issues</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">Every report has a visible resolution trail.</p>
      {!issues.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center bg-neutral-50 dark:bg-neutral-900/40">
          <p className="font-bold text-neutral-900 dark:text-white">You haven't reported anything yet.</p>
          <Link to="/report" className="mt-4 inline-block rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-5 py-3 font-bold transition">Report your first issue</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{issues.map(i => <IssueCard key={i._id} issue={i}/>)}</div>
      )}
    </div>
  );
}
