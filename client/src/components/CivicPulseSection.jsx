import { useState, useEffect } from "react";
import { FileText, AlertTriangle, ShieldCheck, Clock, TrendingUp, Activity } from "lucide-react";
import { api } from "../api.js";

export default function CivicPulseSection() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    response: "< 24h"
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          setStats({
            total: Number(data.stats.total ?? 0),
            active: Number(data.stats.active ?? 0),
            verified: Number(data.stats.aiVerifiedPct ?? 0),
            response: data.stats.avgResolutionHours && data.stats.avgResolutionHours > 0
              ? `< ${Math.ceil(data.stats.avgResolutionHours)}h`
              : "< 24h"
          });
        }
      } catch (err) {
        console.error("Failed to load pulse stats:", err);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const cards = [
    {
      id: "total",
      icon: FileText,
      iconBg: "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700",
      value: stats.total.toLocaleString(),
      label: "Total Reports",
      change: stats.total === 1 ? "1 logged ticket" : `${stats.total} logged tickets`,
      isPositive: true
    },
    {
      id: "active",
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-500 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50",
      value: stats.active.toString(),
      label: "Active Issues",
      change: stats.active === 1 ? "1 active in queue" : `${stats.active} active in queue`,
      isPositive: stats.active === 0
    },
    {
      id: "verified",
      icon: ShieldCheck,
      iconBg: "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700",
      value: stats.verified > 0 ? `${stats.verified}%` : "100%",
      label: "Verified Reports",
      change: "Automated GPS & AI verification",
      isPositive: true
    },
    {
      id: "response",
      icon: Clock,
      iconBg: "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700",
      value: stats.response,
      label: "Avg. Response Time",
      change: "Municipal SLA target",
      isPositive: true
    }
  ];

  return (
    <section id="live-pulse" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header (Matches Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wider text-neutral-900 dark:text-white uppercase">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black dark:bg-white" />
            </span>
            <span>LIVE CIVIC PULSE</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1">
            Real-time overview of civic issues in your city.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Last updated 2 minutes ago</span>
          <span className="h-2 w-2 rounded-full bg-black dark:bg-white" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 shadow-sm hover:border-black dark:hover:border-white hover:shadow-md transition-all"
            >
              {/* Circular Icon */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}>
                <Icon size={22} />
              </div>

              {/* Data & Label */}
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {card.label}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                  <span className={card.isPositive ? "text-neutral-900 dark:text-white" : "text-[#EF4444]"}>
                    ▲ {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
