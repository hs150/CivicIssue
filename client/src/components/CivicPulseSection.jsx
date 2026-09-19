import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Activity, Clock, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react";

export default function CivicPulseSection() {
  const sectionRef = useRef(null);
  const [counts, setCounts] = useState({
    reports: 0,
    active: 0,
    verified: 0,
    resolution: 0
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const target = { reports: 0, active: 0, verified: 0, resolution: 0 };
          gsap.to(target, {
            reports: 247,
            active: 38,
            verified: 91,
            resolution: 24,
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => {
              setCounts({
                reports: Math.floor(target.reports),
                active: Math.floor(target.active),
                verified: Math.floor(target.verified),
                resolution: Math.floor(target.resolution)
              });
            }
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Hourly procedural timeline points (08:00 to 16:00)
  const timelineData = [
    { time: "08:00", count: 18, resolved: 14, height: "42%" },
    { time: "10:00", count: 42, resolved: 36, height: "78%" },
    { time: "12:00", count: 56, resolved: 49, height: "92%" },
    { time: "14:00", count: 39, resolved: 31, height: "65%" },
    { time: "16:00", count: 28, resolved: 24, height: "50%" }
  ];

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
              <span>REAL-TIME TELEMETRY STREAM</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              LIVE CIVIC PULSE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Synchronized municipal event stream and diagnostic volume indicators across current ward zones.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-slate-50 p-2 text-xs font-mono text-slate-500 border border-slate-200">
            <Activity size={14} className="text-emerald-600 animate-pulse" />
            <span>LATENCY: 42ms // SYSTEM NOMINAL</span>
          </div>
        </div>

        {/* 4 Major Metric Counters */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* 1. Reports Today */}
          <div className="pt-4 lg:pt-0 lg:pr-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Reports Today</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight">
                {counts.reports}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                +14.2% <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Citizen submitted issues logged in current 24-hr cycle</p>
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
            <p className="mt-1 text-xs text-slate-500">Currently dispatched or under municipal resolution</p>
          </div>

          {/* 3. AI Verified */}
          <div className="pt-4 lg:pt-0 lg:px-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">AI Verified</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-teal-700 tracking-tight">
                {counts.verified}%
              </span>
              <span className="text-xs font-bold text-teal-600">Landmark Match</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Multimodal Gemini Vision category and fraud checks passed</p>
          </div>

          {/* 4. Average Resolution */}
          <div className="pt-4 lg:pt-0 lg:pl-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Average Resolution</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-700 tracking-tight">
                &lt;{counts.resolution}h
              </span>
              <span className="text-xs font-bold text-emerald-600">SLA Met</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Average duration from report to citizen verification seal</p>
          </div>
        </div>

        {/* Procedural Mini Timeline / Activity Histogram */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                TODAY'S HOURLY INCIDENT INTAKE & RESOLUTION VELOCITY
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Intake
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified Fix
              </span>
            </div>
          </div>

          {/* Minimal Histogram Bars */}
          <div className="grid grid-cols-5 gap-3 h-28 items-end pt-4 pb-1 border-b border-slate-200">
            {timelineData.map((d, i) => (
              <div key={d.time} className="flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                  {/* Intake bar */}
                  <div
                    className="w-1/2 bg-slate-200 rounded-t-md transition-all duration-300 group-hover:bg-slate-300"
                    style={{ height: d.height }}
                  />
                  {/* Verified fix bar */}
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-600 shadow-xs"
                    style={{ height: `calc(${d.height} * 0.85)` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Hours */}
          <div className="grid grid-cols-5 gap-3 text-center mt-2 text-xs font-mono text-slate-400">
            {timelineData.map((d) => (
              <span key={d.time}>{d.time}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
