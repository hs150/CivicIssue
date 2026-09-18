import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  CheckCircle2, Clock3, Inbox, Search, Users, X,
  MapPin, Navigation, ExternalLink, Camera, UploadCloud,
  ShieldCheck, Ban, Eye, FileCheck, Map as MapIcon,
  List, Route, AlertTriangle, Sparkles
} from "lucide-react";
import { api } from "../api.js";
import { Link } from "react-router-dom";
import L from "leaflet";

/* =========================================================
   PHASE CONFIG
========================================================= */

const PHASE_COLORS = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLUTION_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-50 text-slate-600 border-slate-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200"
};

const PRIORITY_COLORS = {
  URGENT: "bg-red-50 text-red-700",
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-green-50 text-green-700"
};

const MARKER_COLORS = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e"
};

const statCards = [
  ["new", "New", Inbox, "text-blue-600"],
  ["inProgress", "In Progress", Clock3, "text-amber-600"],
  ["resolutionReview", "In Review", Eye, "text-purple-600"],
  ["resolved", "Resolved", CheckCircle2, "text-emerald-600"],
  ["closed", "Closed", ShieldCheck, "text-slate-500"],
  ["rejected", "Rejected", Ban, "text-red-500"],
  ["total", "Total", Users, "text-slate-700"]
];

/* =========================================================
   DISTANCE HELPER
========================================================= */

function distanceMeters(a, b) {
  const R = 6371000;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/* =========================================================
   NEAREST-NEIGHBOR ROUTE OPTIMIZER
========================================================= */

function optimizeRoute(start, points) {
  if (!points.length) return [];
  const remaining = [...points];
  const ordered = [];
  let current = start;

  while (remaining.length > 0) {
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceMeters(current, {
        lat: remaining[i].latitude,
        lng: remaining[i].longitude
      });
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }
    const next = remaining.splice(nearest, 1)[0];
    ordered.push({ ...next, _routeDistance: nearestDist });
    current = { lat: next.latitude, lng: next.longitude };
  }
  return ordered;
}

/* =========================================================
   RESOLUTION MODAL
========================================================= */

function ResolutionModal({ issue, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function uploadProof(file) {
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setVerifying(true);
    setVerification(null);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post(`/officer/issues/${issue.id}/verify-fix`, fd);
      setVerification(res.data);
    } catch (err) {
      setVerification({
        verification: {
          verified: false,
          confidence: 0,
          summary: "Verification failed. You can still submit.",
          concerns: [err.response?.data?.message || "Error"]
        }
      });
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit() {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        phase: "RESOLUTION_REVIEW",
        resolutionNote: note,
        resolutionImageUrl: verification?.resolutionImageUrl || null
      });
      onClose();
    } catch {
      setSubmitting(false);
    }
  }

  const v = verification?.verification;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Submit for Resolution Review</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Provide a resolution note and upload proof-of-fix photo for AI anti-corruption verification.
        </p>

        {/* Resolution note */}
        <label className="mt-5 block text-sm font-bold">
          Resolution Note *
          <textarea
            className="field mt-2 min-h-24 resize-y"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe what was done to resolve this issue..."
            required
          />
        </label>

        {/* Proof-of-fix photo */}
        <div className="mt-5">
          <p className="text-sm font-bold">Proof-of-Fix Photo</p>
          <p className="mt-1 text-xs text-slate-500">
            AI will compare this with the original report photo to verify the fix is genuine.
          </p>

          {!proofPreview ? (
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-5 font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <UploadCloud size={20} />
              Upload Proof Photo
              <input
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => uploadProof(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                {issue.image_url && (
                  <div>
                    <p className="mb-1 text-xs font-bold text-slate-500 uppercase">Before</p>
                    <img src={issue.image_url} alt="Before" className="h-36 w-full rounded-xl object-cover border border-slate-200" />
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-bold text-slate-500 uppercase">After (Proof)</p>
                  <img src={proofPreview} alt="Proof" className="h-36 w-full rounded-xl object-cover border border-slate-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Verification result */}
        {verifying && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            <Sparkles size={16} className="mr-2 inline animate-pulse" />
            AI is verifying the fix...
          </div>
        )}

        {v && !verifying && (
          <div className={`mt-4 rounded-2xl border p-4 ${
            v.verified
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}>
            <div className="flex items-center gap-2">
              {v.verified ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={18} className="text-red-600" />
              )}
              <span className={`font-bold ${v.verified ? "text-emerald-800" : "text-red-800"}`}>
                {v.verified ? "✅ Fix Verified" : "⚠️ Verification Concerns"}
              </span>
              <span className="ml-auto text-xs font-bold">
                {Math.round((v.confidence || 0) * 100)}% confidence
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-700">{v.summary}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold">
                Location: {v.locationMatch || "—"}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold">
                Fix: {v.issueAddressed || "—"}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold">
                Match: {Math.round((v.matchScore || 0) * 100)}%
              </span>
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

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!note.trim() || submitting || verifying}
            className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PHASE ACTION BUTTONS
========================================================= */

function PhaseActions({ issue, onUpdate, onOpenModal }) {
  const phase = issue.phase || issue.status;

  const btnClass = (color) =>
    `rounded-lg px-3 py-2 text-xs font-bold transition-colors ${color}`;

  switch (phase) {
    case "NEW":
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate(issue.id, { phase: "IN_PROGRESS" })}
            className={btnClass("bg-amber-500 text-white hover:bg-amber-600")}
          >
            Accept & Start
          </button>
          <button
            onClick={() => onUpdate(issue.id, { phase: "REJECTED", resolutionNote: "Rejected by officer" })}
            className={btnClass("border border-red-300 text-red-600 hover:bg-red-50")}
          >
            Reject
          </button>
        </div>
      );
    case "IN_PROGRESS":
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenModal(issue)}
            className={btnClass("bg-purple-600 text-white hover:bg-purple-700")}
          >
            <FileCheck size={14} className="mr-1 inline" />
            Submit Fix
          </button>
        </div>
      );
    case "RESOLUTION_REVIEW":
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdate(issue.id, { phase: "RESOLVED" })}
            className={btnClass("bg-emerald-600 text-white hover:bg-emerald-700")}
          >
            Approve
          </button>
          <button
            onClick={() => onUpdate(issue.id, { phase: "IN_PROGRESS", resolutionNote: "Sent back for rework" })}
            className={btnClass("border border-amber-300 text-amber-700 hover:bg-amber-50")}
          >
            Send Back
          </button>
        </div>
      );
    case "RESOLVED":
      return (
        <button
          onClick={() => onUpdate(issue.id, { phase: "CLOSED" })}
          className={btnClass("bg-slate-600 text-white hover:bg-slate-700")}
        >
          Close Issue
        </button>
      );
    default:
      return (
        <span className="text-xs text-slate-400 italic">No actions</span>
      );
  }
}

/* =========================================================
   OFFICER MAP
========================================================= */

function OfficerMap({ issues, officerPos }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);

  const [route, setRoute] = useState(null);
  const [routeList, setRouteList] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = officerPos
      ? [officerPos.lat, officerPos.lng]
      : [28.6139, 77.2090];

    const map = L.map(mapContainerRef.current).setView(center, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Officer marker
    if (officerPos) {
      const officerIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:grid;place-items:center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const om = L.marker([officerPos.lat, officerPos.lng], { icon: officerIcon })
        .addTo(map)
        .bindPopup("<b>📍 Your Location</b>");
      markersRef.current.push(om);
    }

    // Issue markers
    const activeIssues = issues.filter(i =>
      i.latitude && i.longitude && !["CLOSED", "REJECTED"].includes(i.phase)
    );

    activeIssues.forEach(issue => {
      const color = MARKER_COLORS[issue.priority] || MARKER_COLORS.MEDIUM;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);display:grid;place-items:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const m = L.marker([issue.latitude, issue.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px">
            <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
              <span style="background:${color};color:white;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700">${issue.priority}</span>
              <span style="font-size:11px;color:#94a3b8">${issue.issue_code || ""}</span>
            </div>
            <b style="font-size:14px">${issue.title}</b>
            <p style="font-size:12px;color:#64748b;margin-top:4px">${issue.address || issue.department || ""}</p>
            <p style="font-size:11px;color:#94a3b8;margin-top:4px">${issue.phase?.replace("_", " ")} • ${issue.upvotes || 0} supporters</p>
          </div>
        `);

      markersRef.current.push(m);
    });

    // Fit bounds
    if (activeIssues.length > 0) {
      const allPoints = activeIssues.map(i => [i.latitude, i.longitude]);
      if (officerPos) allPoints.push([officerPos.lat, officerPos.lng]);
      map.fitBounds(allPoints, { padding: [40, 40] });
    }
  }, [issues, officerPos]);

  // Draw/clear route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (route && route.length > 0) {
      const points = [];
      if (officerPos) points.push([officerPos.lat, officerPos.lng]);
      route.forEach(i => points.push([i.latitude, i.longitude]));

      routeLineRef.current = L.polyline(points, {
        color: "#6366f1",
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 8"
      }).addTo(map);

      // Add numbered labels
      route.forEach((issue, idx) => {
        const numIcon = L.divIcon({
          className: "",
          html: `<div style="width:22px;height:22px;border-radius:50%;background:#6366f1;color:white;font-size:11px;font-weight:800;display:grid;place-items:center;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)">${idx + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const m = L.marker([issue.latitude, issue.longitude], { icon: numIcon, interactive: false }).addTo(map);
        markersRef.current.push(m);
      });
    }
  }, [route, officerPos]);

  function runOptimizer() {
    if (!officerPos) return;
    const active = issues.filter(i =>
      i.latitude && i.longitude &&
      ["NEW", "IN_PROGRESS", "RESOLUTION_REVIEW"].includes(i.phase)
    );
    const optimized = optimizeRoute(officerPos, active);
    setRoute(optimized);
    setRouteList(optimized);
  }

  function openGoogleMaps() {
    if (!route || !officerPos) return;
    const origin = `${officerPos.lat},${officerPos.lng}`;
    const dest = `${route[route.length - 1].latitude},${route[route.length - 1].longitude}`;
    const waypoints = route.slice(0, -1)
      .map(i => `${i.latitude},${i.longitude}`)
      .join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=driving`;
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Map controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runOptimizer}
          disabled={!officerPos}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Route size={16} />
          Optimize Route
        </button>

        {route && (
          <button
            onClick={openGoogleMaps}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink size={16} />
            Open in Google Maps
          </button>
        )}

        {route && (
          <button
            onClick={() => { setRoute(null); setRouteList([]); }}
            className="flex items-center gap-2 rounded-xl border border-red-300 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            <X size={14} />
            Clear Route
          </button>
        )}

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-xs font-bold text-slate-500">
          {Object.entries(MARKER_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapContainerRef}
        className="h-[480px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      />

      {/* Route list */}
      {routeList.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
          <h3 className="flex items-center gap-2 font-bold text-indigo-900">
            <Route size={16} />
            Optimized Visit Order ({routeList.length} stops)
          </h3>
          <div className="mt-3 space-y-2">
            {routeList.map((issue, idx) => (
              <div key={issue.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-black text-white">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/issues/${issue.id}`} className="font-bold text-sm hover:text-indigo-700 truncate block">
                    {issue.title}
                  </Link>
                  <p className="text-xs text-slate-500 truncate">
                    {issue.address || issue.department || "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PRIORITY_COLORS[issue.priority] || ""}`}>
                    {issue.priority}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistance(issue._routeDistance || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("");
  const [query_, setQuery] = useState("");
  const [view, setView] = useState("list"); // "list" | "map"
  const [modalIssue, setModalIssue] = useState(null);
  const [officerPos, setOfficerPos] = useState(null);

  async function load() {
    const [s, i] = await Promise.all([
      api.get("/officer/stats"),
      api.get("/officer/issues")
    ]);
    setStats(s.data.stats);
    setIssues(i.data.issues);
  }

  useEffect(() => {
    load();
    navigator.geolocation?.getCurrentPosition(
      pos => setOfficerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const filtered = useMemo(() => issues.filter(i => {
    const matchesFilter = !filter || i.phase === filter;
    const q = query_.toLowerCase();
    const matchesQuery = !q || `${i.title} ${i.category} ${i.issue_code} ${i.department || ""}`.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  }), [issues, filter, query_]);

  async function updateIssue(id, body) {
    await api.patch(`/officer/issues/${id}`, body);
    load();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      {/* Header */}
      <div>
        <p className="font-bold text-emerald-700">Authority workspace</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Officer Dashboard</h1>
        <p className="mt-2 text-slate-500">Prioritize, assign and resolve citizen reports with AI-powered verification.</p>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {statCards.map(([key, label, Icon, iconColor]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key.toUpperCase ? "" : "")}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              <Icon size={16} className={iconColor} />
            </div>
            <p className="mt-2 text-3xl font-black">{stats[key] || 0}</p>
          </button>
        ))}
      </div>

      {/* View toggle + filters */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <List size={15} /> List
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  view === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <MapIcon size={15} /> Map
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                className="field pl-10"
                value={query_}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search issues…"
              />
            </div>
          </div>

          {/* Phase filter */}
          <select
            className="field md:w-52"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All Phases</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLUTION_REVIEW">Resolution Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="divide-y">
            {filtered.length === 0 && (
              <div className="grid place-items-center py-16 text-slate-400">
                <Inbox size={40} className="mb-3" />
                <p className="font-bold">No issues match your filters</p>
              </div>
            )}

            {filtered.map(issue => (
              <div key={issue.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between hover:bg-slate-50/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Phase badge */}
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${PHASE_COLORS[issue.phase] || PHASE_COLORS.NEW}`}>
                      {(issue.phase || "NEW").replace(/_/g, " ")}
                    </span>

                    {/* Priority badge */}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${PRIORITY_COLORS[issue.priority] || ""}`}>
                      {issue.priority}
                    </span>

                    <span className="text-xs text-slate-400">{issue.issue_code}</span>

                    {/* Fix verification badge */}
                    {issue.fix_verification?.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        <ShieldCheck size={12} /> AI Verified
                      </span>
                    )}
                  </div>

                  <Link to={`/issues/${issue.id}`} className="mt-2 block font-extrabold hover:text-emerald-700 truncate">
                    {issue.title}
                  </Link>

                  <p className="mt-1 text-sm text-slate-500 truncate">
                    {issue.department || issue.category} • {issue.address || "Pinned location"} • {issue.upvotes || 0} supporters
                    {issue.assignedTo?.name && ` • 👤 ${issue.assignedTo.name}`}
                  </p>
                </div>

                <PhaseActions
                  issue={issue}
                  onUpdate={updateIssue}
                  onOpenModal={setModalIssue}
                />
              </div>
            ))}
          </div>
        )}

        {/* MAP VIEW */}
        {view === "map" && (
          <div className="p-5">
            <OfficerMap issues={filtered} officerPos={officerPos} />
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {modalIssue && (
        <ResolutionModal
          issue={modalIssue}
          onClose={() => setModalIssue(null)}
          onSubmit={body => updateIssue(modalIssue.id, body)}
        />
      )}
    </div>
  );
}
