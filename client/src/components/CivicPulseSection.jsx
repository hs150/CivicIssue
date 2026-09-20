import { useState, useEffect } from "react";
import { FileText, AlertTriangle, ShieldCheck, Clock, TrendingUp, Activity } from "lucide-react";
import { api } from "../api.js";

export default function CivicPulseSection() {
  const [stats, setStats] = useState({
    total: 2481,
    active: 127,
    verified: 94,
    response: "< 24h"
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          setStats({
            total: data.stats.total || 2481,
            active: data.stats.active || 127,
            verified: data.stats.aiVerifiedPct || 94,
            response: data.stats.avgResolutionHours ? `< ${Math.ceil(data.stats.avgResolutionHours)}h` : "< 24h"
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
      iconBg: "bg-emerald-50 text-[#00A881] border border-emerald-100",
      value: stats.total.toLocaleString(),
      label: "Total Reports",
      change: "12% from last week",
      isPositive: true
    },
    {
      id: "active",
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-500 border border-amber-100",
      value: stats.active.toString(),
      label: "Active Issues",
      change: "5% from last week",
      isPositive: false
    },
    {
      id: "verified",
      icon: ShieldCheck,
      iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
      value: `${stats.verified}%`,
      label: "Verified Reports",
      change: "3% from last week",
      isPositive: true
    },
    {
      id: "response",
      icon: Clock,
      iconBg: "bg-indigo-50 text-indigo-500 border border-indigo-100",
      value: stats.response,
      label: "Avg. Response Time",
      change: "22% from last week",
      isPositive: true
    }
  ];

  return (
    <section id="live-pulse" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header (Matches Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wider text-[#07111F] uppercase">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A881] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A881]" />
            </span>
            <span>LIVE CIVIC PULSE</span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time overview of civic issues in your city.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <span>Last updated 2 minutes ago</span>
          <span className="h-2 w-2 rounded-full bg-[#00A881]" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:border-[#00A881]/50 hover:shadow-md transition-all"
            >
              {/* Circular Icon */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}>
                <Icon size={22} />
              </div>

              {/* Data & Label */}
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#07111F]">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-[#64748B] mt-0.5">
                  {card.label}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                  <span className={card.isPositive ? "text-[#00A881]" : "text-[#EF4444]"}>
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
