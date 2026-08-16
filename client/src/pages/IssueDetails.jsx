import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import MapPicker from "../components/MapPicker.jsx";
import StatusTimeline from "../components/StatusTimeline.jsx";

export default function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");

  async function load() {
    try {
      const res = await api.get(`/issues/${id}`);
      setData(res.data);
    } catch { navigate("/issues"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function upvote() {
    if (!user) return navigate("/login");
    await api.post(`/issues/${id}/upvote`);
    load();
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setAction("");
    try {
      await api.post(`/issues/${id}/comments`, { text: comment });
      setComment("");
      load();
    } catch (err) { setAction(err.response?.data?.message || "Unable to comment."); }
  }

  if (loading || !data) return <div className="grid min-h-[60vh] place-items-center">Loading issue…</div>;

  const { issue, comments, history } = data;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/issues" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"><ArrowLeft size={16}/> All issues</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {issue.imageUrl ? <img src={issue.imageUrl} alt="" className="h-80 w-full object-cover" /> : <div className="grid h-80 place-items-center bg-gradient-to-br from-emerald-50 to-slate-100 text-7xl">🏙️</div>}
          <div className="p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{issue.status.replace("_", " ")}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{issue.priority}</span>
              <span className="text-xs text-slate-400">{issue.issueCode}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight">{issue.title}</h1>
            <p className="mt-4 leading-7 text-slate-600">{issue.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><MapPin size={17}/>{issue.location?.address || `${issue.location?.latitude}, ${issue.location?.longitude}`}</div>

            <div className="mt-6 h-72"><MapPicker value={issue.location} readOnly/></div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={upvote} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold hover:bg-slate-50"><ThumbsUp size={18}/> Support ({issue.upvotes || 0})</button>
              <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500"><MessageCircle size={17}/> {comments.length} comments</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Resolution timeline</h2>
            <div className="mt-6"><StatusTimeline current={issue.status} history={history}/></div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Comments</h2>
            <div className="mt-5 space-y-4">
              {comments.map(c => (
                <div key={c._id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3"><b className="text-sm">{c.userId?.name || "Citizen"}</b><span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{c.text}</p>
                </div>
              ))}
              {!comments.length && <p className="text-sm text-slate-500">No comments yet.</p>}
            </div>

            {user && <form onSubmit={addComment} className="mt-5 flex gap-2">
              <input className="field" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a useful comment…" />
              <button className="grid w-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white"><Send size={17}/></button>
            </form>}
            {action && <p className="mt-2 text-sm text-red-600">{action}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
