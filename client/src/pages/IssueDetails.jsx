import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, MessageCircle, Send, ThumbsUp,
  Sparkles, ShieldCheck, AlertTriangle, Eye, Camera,
  Zap, Cloud, Gauge, CheckCircle2, XCircle, Shield
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import MapPicker from "../components/MapPicker.jsx";
import StatusTimeline from "../components/StatusTimeline.jsx";
import BeforeAfterSlider from "../components/BeforeAfterSlider.jsx";
import { Share2, UserCheck, Clock } from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const SEVERITY_STYLES = {
  URGENT: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-800 border-emerald-200"
};

function ConfidenceRing({ value, size = 48 }) {
  const pct = Math.round((value || 0) * 100);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-black" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

/* =========================================================
   AI INSPECTION REPORT CARD
========================================================= */

function AIInspectionReport({ ai }) {
  if (!ai || (!ai.issue && !ai.evidence)) return null;

  const issue = ai.issue || {};
  const evidence = ai.evidence || {};
  const safety = ai.safety || {};
  const routing = ai.routing || {};
  const visualEvidence = ai.visualEvidence || {};
  const environment = ai.environment || {};
  const aiMeta = ai.ai || {};

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-indigo-600" />
        <h2 className="text-lg font-black text-indigo-900">Gemini AI Inspection Report</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* Confidence */}
        {evidence.confidence !== undefined && (
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4">
            <ConfidenceRing value={evidence.confidence} />
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">AI Confidence</p>
              <p className="font-bold text-slate-800">
                {evidence.confidence >= 0.8 ? "High" : evidence.confidence >= 0.5 ? "Medium" : "Low"}
              </p>
            </div>
          </div>
        )}

        {/* Category & Subcategory */}
        {issue.subcategory && (
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Detected Issue</p>
            <p className="mt-1 font-bold text-slate-800">{issue.subcategory}</p>
            {issue.category && (
              <p className="mt-0.5 text-xs text-slate-500">Category: {issue.category}</p>
            )}
          </div>
        )}

        {/* Severity */}
        {issue.severity && (
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Severity</p>
            <Badge className={`mt-1.5 ${SEVERITY_STYLES[issue.severity?.toUpperCase()] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              <Zap size={12} />
              {issue.severity}
            </Badge>
          </div>
        )}

        {/* Department Routing */}
        {routing.department && (
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Routed To</p>
            <p className="mt-1 font-bold text-slate-800">{routing.department}</p>
            {routing.recommendedAction && (
              <p className="mt-0.5 text-xs text-slate-500">{routing.recommendedAction}</p>
            )}
          </div>
        )}

        {/* Safety Hazard */}
        <div className="rounded-2xl bg-white/80 p-4">
          <div className="flex items-center gap-2">
            {safety.hazardDetected ? (
              <AlertTriangle size={16} className="text-red-600" />
            ) : (
              <Shield size={16} className="text-emerald-600" />
            )}
            <p className="text-xs font-bold uppercase text-slate-500">Safety Hazard</p>
          </div>
          <p className={`mt-1 font-bold ${safety.hazardDetected ? "text-red-700" : "text-emerald-700"}`}>
            {safety.hazardDetected ? "⚠ Hazard Detected" : "No hazard detected"}
          </p>
          {safety.hazardType?.length > 0 && (
            <p className="mt-0.5 text-xs text-red-600">{safety.hazardType.join(", ")}</p>
          )}
          {safety.riskLevel && safety.riskLevel !== "UNKNOWN" && (
            <p className="mt-0.5 text-xs text-slate-500">Risk: {safety.riskLevel}</p>
          )}
        </div>

        {/* Image Quality */}
        {evidence.imageQuality && evidence.imageQuality !== "UNKNOWN" && (
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-slate-500" />
              <p className="text-xs font-bold uppercase text-slate-500">Image Quality</p>
            </div>
            <p className="mt-1 font-bold text-slate-800">{evidence.imageQuality}</p>
          </div>
        )}

        {/* Visual Evidence */}
        {visualEvidence.objects?.length > 0 && (
          <div className="rounded-2xl bg-white/80 p-4 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-500" />
              <p className="text-xs font-bold uppercase text-slate-500">Visual Evidence</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visualEvidence.objects.map((obj, i) => (
                <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {obj}
                </span>
              ))}
            </div>
            {visualEvidence.damage?.detected && (
              <p className="mt-2 text-xs text-orange-700">
                Damage: {visualEvidence.damage.type} — Extent: {visualEvidence.damage.estimatedExtent}
              </p>
            )}
          </div>
        )}

        {/* Environment */}
        {(environment.weather !== "UNKNOWN" || environment.lighting !== "UNKNOWN") && (
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="flex items-center gap-2">
              <Cloud size={16} className="text-slate-500" />
              <p className="text-xs font-bold uppercase text-slate-500">Environment</p>
            </div>
            <p className="mt-1 text-sm text-slate-700">
              {environment.weather !== "UNKNOWN" && `Weather: ${environment.weather}`}
              {environment.weather !== "UNKNOWN" && environment.lighting !== "UNKNOWN" && " • "}
              {environment.lighting !== "UNKNOWN" && `Light: ${environment.lighting}`}
            </p>
          </div>
        )}
      </div>

      {/* Relevance + Suspicious + Human Review warnings */}
      <div className="mt-4 flex flex-wrap gap-2">
        {evidence.relevant !== undefined && (
          <Badge className={evidence.relevant ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
            {evidence.relevant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
            {evidence.relevant ? "Relevant to civic reporting" : "May not show a clear issue"}
          </Badge>
        )}
        {evidence.suspicious && (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <XCircle size={12} />
            Suspicious image detected
          </Badge>
        )}
        {aiMeta.requiresHumanReview && (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle size={12} />
            Human review recommended
          </Badge>
        )}
      </div>

      {/* Model info */}
      {aiMeta.model && (
        <p className="mt-3 text-xs text-slate-400">
          Analyzed by {aiMeta.model}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   BEFORE vs AFTER COMPARISON
========================================================= */

function FixComparison({ beforeUrl, afterUrl, verification }) {
  if (!afterUrl) return null;

  const v = verification || {};

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={20} className="text-indigo-600" />
        <h2 className="text-lg font-black">Proof-of-Fix Anti-Corruption Inspection</h2>
      </div>

      {/* Interactive Before/After Slider */}
      {beforeUrl ? (
        <BeforeAfterSlider
          beforeImage={beforeUrl}
          afterImage={afterUrl}
          beforeLabel="Reported Problem"
          afterLabel="Officer Fix"
          aspectRatio="16/10"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img src={afterUrl} alt="After — Proof of Fix" className="h-64 w-full object-cover" />
        </div>
      )}

      {/* AI Verification Result */}
      {v.provider && (
        <div className={`mt-4 rounded-2xl border p-4 ${
          v.verified ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
        }`}>
          <div className="flex items-center gap-2">
            {v.verified ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="font-bold text-emerald-800">✅ Fix Verified by AI</span>
              </>
            ) : (
              <>
                <AlertTriangle size={18} className="text-red-600" />
                <span className="font-bold text-red-800">⚠️ Verification Concerns</span>
              </>
            )}
            <span className="ml-auto text-xs font-bold">
              {Math.round((v.confidence || 0) * 100)}% confidence
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-700">{v.summary}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-white/80 border-slate-200 text-slate-700">
              Location: {v.locationMatch || "—"}
            </Badge>
            <Badge className="bg-white/80 border-slate-200 text-slate-700">
              Fix: {v.issueAddressed || "—"}
            </Badge>
            <Badge className="bg-white/80 border-slate-200 text-slate-700">
              Match: {Math.round((v.matchScore || 0) * 100)}%
            </Badge>
          </div>

          {v.concerns?.length > 0 && (
            <div className="mt-3 space-y-1">
              {v.concerns.map((c, i) => (
                <p key={i} className="text-xs text-red-700">⚠ {c}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function IssueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
    try {
      await api.post(`/issues/${id}/upvote`);
      toast.success("Your support has been recorded! 👍");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not record support.");
    }
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Issue link copied to clipboard! 📋");
    } else {
      toast.info("Link: " + window.location.href);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    setAction("");
    try {
      await api.post(`/issues/${id}/comments`, { text: comment });
      setComment("");
      toast.success("Comment posted successfully!");
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to comment.";
      setAction(msg);
      toast.error(msg);
    }
  }

  if (loading || !data) return <div className="grid min-h-[60vh] place-items-center">Loading issue…</div>;

  const { issue, comments, history } = data;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/issues" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"><ArrowLeft size={16}/> All issues</Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        {/* ============== LEFT COLUMN ============== */}
        <div className="space-y-6">
          {/* Main issue card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {issue.imageUrl ? <img src={issue.imageUrl} alt="" className="h-80 w-full object-cover" /> : <div className="grid h-80 place-items-center bg-gradient-to-br from-emerald-50 to-slate-100 text-7xl">🏙️</div>}
            <div className="p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{(issue.phase || issue.status || "").replace(/_/g, " ")}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{issue.priority}</span>
                <span className="text-xs text-slate-400 font-mono">{issue.issueCode}</span>

                {/* AI Verified badge */}
                {issue.fixVerification?.verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <ShieldCheck size={12} />
                    AI Fix Verified
                  </Badge>
                )}
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">{issue.title}</h1>
              <p className="mt-4 leading-7 text-slate-600">{issue.description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><MapPin size={17}/>{issue.location?.address || `${issue.location?.latitude}, ${issue.location?.longitude}`}</div>

              <div className="mt-6 h-72"><MapPicker value={issue.location} readOnly/></div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={upvote} className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 font-bold hover:bg-emerald-100 transition active:scale-95"><ThumbsUp size={18}/> Support ({issue.upvotes || 0})</button>
                <button onClick={handleShare} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 transition"><Share2 size={17}/> Share</button>
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500"><MessageCircle size={17}/> {comments.length} comments</span>
              </div>
            </div>
          </div>

          {/* AI Inspection Report */}
          <AIInspectionReport ai={issue.aiAnalysis} />

          {/* Before vs After comparison */}
          {issue.resolutionImageUrl && (
            <FixComparison
              beforeUrl={issue.imageUrl}
              afterUrl={issue.resolutionImageUrl}
              verification={issue.fixVerification}
            />
          )}
        </div>

        {/* ============== RIGHT COLUMN ============== */}
        <div className="space-y-6">
          {/* Resolution timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Resolution Timeline</h2>
            <div className="mt-6"><StatusTimeline current={issue.phase || issue.status} history={history}/></div>
          </div>

          {/* Officer Assignment & Audit Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-600" /> Administrative Audit
            </h2>
            <div className="mt-3 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Assigned Officer:</span>
                <span className="font-semibold text-slate-800">{issue.assignedTo ? "Designated Field Officer" : "Pending Assignment"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">{issue.category || "Municipal Works"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Reported On:</span>
                <span className="font-semibold text-slate-800">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              {issue.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolved Date:</span>
                  <span className="font-semibold text-emerald-700">{new Date(issue.resolvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resolution note */}
          {issue.resolutionNote && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 shadow-sm">
              <h2 className="text-lg font-black text-emerald-900">Official Resolution Note</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-800">{issue.resolutionNote}</p>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black">Community Comments</h2>
            <div className="mt-5 space-y-4">
              {comments.map(c => (
                <div key={c.id} className="rounded-2xl bg-slate-50 p-4">
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
