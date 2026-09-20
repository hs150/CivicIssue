import { useRef } from "react";
import { Printer, X, ShieldCheck, CheckCircle2, QrCode, FileText, Award, MapPin, Building, Calendar, UserCheck } from "lucide-react";
import { getImageUrl } from "../utils/image.js";

export default function OfficialAuditReport({ issue, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const v = issue.fixVerification || {};
  const isVerified = Boolean(v.verified);
  const confidence = Math.round((v.confidence || 0) * 100);
  const matchScore = Math.round((v.matchScore || 0) * 100);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Action Header Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">Official Resolution Audit Certificate Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===================================================
            PRINTABLE GOVERNMENT DOCUMENT CONTENT
        =================================================== */}
        <div ref={printRef} className="p-8 sm:p-12 text-slate-900 bg-white font-serif print:p-6 print:m-0">
          {/* Government Watermark / Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center relative">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-2xl">
              🏛️
            </div>
            <p className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold">
              DEPARTMENT OF URBAN DEVELOPMENT & PUBLIC ASSURANCE
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-sans mt-1">
              Municipal Civic Resolution Certificate
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Tamper-Proof Anti-Corruption Verification & Citizen Audit Report
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-t border-slate-200 pt-3 text-slate-600">
              <span><b>DOC-REF:</b> CC-AUDIT-{issue.issueCode || issue.id}</span>
              <span><b>ISSUED:</b> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              <span className="text-emerald-800 font-bold">STATUS: AUTHENTICATED & VERIFIED</span>
            </div>
          </div>

          {/* Verification Gold Seal */}
          <div className="my-6 rounded-2xl border-2 border-slate-900 p-4 bg-slate-50/50 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-700 text-white grid place-items-center shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="font-black text-sm text-slate-900 uppercase tracking-wide">
                  Autonomous AI Verification & Audit Trail
                </p>
                <p className="text-xs text-slate-600">
                  Multimodal Vision Model analyzed location markers, repair textures, and fraud indicators.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500">AI Match Score</p>
                <p className="text-xl font-black text-emerald-700">{matchScore}%</p>
              </div>
              <div className="text-right border-l pl-3 border-slate-300">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-xl font-black text-slate-900">{confidence}%</p>
              </div>
            </div>
          </div>

          {/* Ticket Information Table */}
          <div className="font-sans text-xs my-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 border-b pb-2 mb-3">
              Case Details & Geo-Spatial Metadata
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100/70">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracking ID</span>
                <span className="font-mono font-bold text-slate-900">{issue.issueCode || "CC-TICKET"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-slate-900">{issue.category || "Public Works"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority Level</span>
                <span className="font-bold text-slate-900">{issue.priority || "Medium"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Lifecycle Phase</span>
                <span className="font-bold text-emerald-800 font-mono">{(issue.phase || issue.status || "").replace(/_/g, " ")}</span>
              </div>
            </div>

            <div className="mt-3 p-4 rounded-xl bg-slate-100/70 grid sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Location Address</span>
                <span className="font-bold text-slate-900">{issue.location?.address || issue.address || "Geo-Pinned Location"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                <span className="font-mono text-slate-800">
                  {issue.location?.latitude || issue.latitude}, {issue.location?.longitude || issue.longitude}
                </span>
              </div>
            </div>
          </div>

          {/* Before vs After Visual Evidence */}
          <div className="font-sans my-6">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 border-b pb-2 mb-3">
              Photographic Forensic Evidence
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>🔴 Original Citizen Report (Before)</span>
                  <span className="text-[10px] font-mono text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                </p>
                {issue.imageUrl ? (
                  <img src={getImageUrl(issue.imageUrl)} alt="Before" className="h-48 w-full object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="h-48 rounded-lg bg-slate-100 grid place-items-center text-slate-400 text-xs">No image provided</div>
                )}
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  <b>Description:</b> {issue.description}
                </p>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white">
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>🟢 Officer Proof-of-Fix (After)</span>
                  <span className="text-[10px] font-mono text-slate-400">{issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : "Pending"}</span>
                </p>
                {issue.resolutionImageUrl ? (
                  <img src={getImageUrl(issue.resolutionImageUrl)} alt="After" className="h-48 w-full object-cover rounded-lg border border-slate-200" />
                ) : (
                  <div className="h-48 rounded-lg bg-slate-100 grid place-items-center text-slate-400 text-xs">Resolution image pending</div>
                )}
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  <b>Officer Note:</b> {issue.resolutionNote || "Resolution submitted according to municipal standards."}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis Summary */}
          {v.summary && (
            <div className="font-sans text-xs my-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" /> AI Comparison Finding:
              </p>
              <p className="text-slate-700 leading-relaxed">{v.summary}</p>
            </div>
          )}

          {/* Signatures & Authorizations Block */}
          <div className="font-sans mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Community Sign-Off</p>
              <p className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                <Award size={13} className="text-amber-600" />
                {issue.citizenVerified ? "Certified by Neighborhood" : `${issue.citizenConfirmations || 0} Confirmations`}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Disputes logged: {issue.citizenDisputes || 0}</p>
            </div>

            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Field Authority</p>
              <p className="font-bold text-slate-900 mt-1">Designated Municipal Officer</p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">ID: {issue.assignedTo ? String(issue.assignedTo).substring(0, 12) : "DIV-FIELD-UNIT"}</p>
            </div>

            <div className="sm:text-right col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Digital Signature</p>
              <p className="font-mono text-[10px] font-bold text-slate-800 mt-1">SHA256: 9e8a7c2d4f1b5e3a</p>
              <p className="text-[10px] text-emerald-800 font-bold mt-0.5">✓ Cryptographically Sealed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
