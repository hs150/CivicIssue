import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import IssueCard from "../components/IssueCard.jsx";

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  useEffect(() => { api.get("/issues/mine").then(r => setIssues(r.data.issues)); }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="font-bold text-emerald-700">Citizen portal</p>
      <h1 className="mt-2 text-4xl font-black">My issues</h1>
      <p className="mt-2 text-slate-500">Every report has a visible resolution trail.</p>
      {!issues.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <p className="font-bold">You haven't reported anything yet.</p>
          <Link to="/report" className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Report your first issue</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{issues.map(i => <IssueCard key={i._id} issue={i}/>)}</div>
      )}
    </div>
  );
}
