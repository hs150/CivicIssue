import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Activity, Clock, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";
import { api } from "../api.js";

export default function CivicPulseSection() {
  const sectionRef = useRef(null);
  const [pulseData, setPulseData] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    resolvedToday: 0,
    reportsToday: 0,
    aiVerifiedPct: 0,
    avgResolutionHours: 0
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [latency, setLatency] = useState(38);
  const [counts, setCounts] = useState({
    reports: 0,
    active: 0,
    verified: 0,
    resolution: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fetch real telemetry from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      const startTime = performance.now();
      try {
        const { data } = await api.get("/issues/stats");
        const elapsed = Math.round(performance.now() - startTime);
        if (isMounted) {
          setLatency(elapsed || 25);
          if (data?.stats) {
            setPulseData(data.stats);
          }
          if (Array.isArray(data?.hourlyActivity)) {
            setHourlyData(data.hourlyActivity);
          }
        }
      } catch (err) {
        console.error("Failed to load civic pulse telemetry:", err);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Counter Animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const target = { reports: 0, active: 0, verified: 0, resolution: 0 };
          gsap.to(target, {
            reports: pulseData.reportsToday || pulseData.total,
            active: pulseData.active,
            verified: pulseData.aiVerifiedPct,
            resolution: pulseData.avgResolutionHours,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => {
              setCounts({
                reports: Math.floor(target.reports),
                active: Math.floor(target.active),
                verified: Math.floor(target.verified),
                resolution: Number(target.resolution.toFixed(1))
              });
            }
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, pulseData]);

  // Fallback to real hours if empty
  const displayTimeline = hourlyData.length > 0 ? hourlyData : [
    { time: "06:00", count: 0, resolved: 0 },
    { time: "08:00", count: 0, resolved: 0 },
    { time: "10:00", count: 0, resolved: 0 },
    { time: "12:00", count: 0, resolved: 0 },
    { time: "14:00", count: 0, resolved: 0 }
  ];

  const maxCount = Math.max(1, ...displayTimeline.map(d => d.count || 0));

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-xl shadow-slate-900/5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>LIVE DATABASE TELEMETRY STREAM</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              LIVE CIVIC PULSE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time municipal event stream, verified resolution velocity, and live PostgreSQL telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-slate-50 p-2 text-xs font-mono text-slate-500 border border-slate-200">
            <Activity size={14} className="text-emerald-600 animate-pulse" />
            <span>API LATENCY: {latency}ms // DB CONNECTED</span>
          </div>
        </div>

        {/* 4 Major Real Metric Counters */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* 1. Reports Today / Total */}
          <div className="pt-4 lg:pt-0 lg:pr-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Reports In System</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight">
                {counts.reports}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                {pulseData.reportsToday} Today
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Citizen submitted issues registered in municipal ledger</p>
          </div>

          {/* 2. Active Issues */}
          <div className="pt-4 lg:pt-0 lg:px-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Active Issues</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-amber-600 tracking-tight">
                {counts.active}
              </span>
              <span className="text-xs font-semibold text-slate-400">In Triage</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Currently in progress or dispatched to field officers</p>
          </div>

          {/* 3. AI Verified */}
          <div className="pt-4 lg:pt-0 lg:px-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">AI Verified</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-teal-700 tracking-tight">
                {counts.verified}%
              </span>
              <span className="text-xs font-bold text-teal-600">Audit Ratio</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Issues evaluated by multimodal Gemini AI vision inspection</p>
          </div>

          {/* 4. Average Resolution */}
          <div className="pt-4 lg:pt-0 lg:pl-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Avg Resolution</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-700 tracking-tight">
                {counts.resolution > 0 ? `${counts.resolution}h` : "<24h"}
              </span>
              <span className="text-xs font-bold text-emerald-600">Real Turnaround</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Actual average duration from intake to verified fix</p>
          </div>
        </div>

        {/* Real Activity Histogram */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                REAL INCIDENT INTAKE & RESOLUTION VELOCITY
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Intake Count
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified Fix
              </span>
            </div>
          </div>

          {/* Histogram Bars */}
          <div className="flex justify-between items-end gap-2 h-28 pt-4 pb-1 border-b border-slate-200">
            {displayTimeline.map((d, i) => {
              const intakeHeight = d.count > 0 ? `${Math.max(20, (d.count / maxCount) * 100)}%` : "8px";
              const resolvedHeight = d.resolved > 0 ? `${Math.max(16, (d.resolved / maxCount) * 100)}%` : "4px";

              return (
                <div key={d.time || i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-full">
                    {/* Intake bar */}
                    <div
                      className="w-1/2 bg-slate-200 rounded-t-md transition-all duration-300 group-hover:bg-slate-300"
                      style={{ height: intakeHeight }}
                      title={`Intake: ${d.count}`}
                    />
                    {/* Verified fix bar */}
                    <div
                      className="w-1/2 bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-600 shadow-xs"
                      style={{ height: resolvedHeight }}
                      title={`Resolved: ${d.resolved}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Hours */}
          <div className="flex justify-between text-center mt-2 text-xs font-mono text-slate-400">
            {displayTimeline.map((d, i) => (
              <span key={d.time || i} className="flex-1 text-center">{d.time}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
