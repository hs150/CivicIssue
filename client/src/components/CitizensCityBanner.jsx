import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "../api.js";
import ghatsSketchImg from "../assets/varanasi_ghats_sketch.jpg";

export default function CitizensCityBanner() {
  const [stats, setStats] = useState({
    citizens: "10K+",
    wards: "50+",
    resolved: "1,000+"
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          setStats({
            citizens: data.stats.total ? `${Math.max(10, data.stats.total * 5)}K+` : "10K+",
            wards: "50+",
            resolved: data.stats.resolved > 0 ? `${data.stats.resolved.toLocaleString()}+` : "1,000+"
          });
        }
      } catch (err) {
        console.error("Failed to load banner stats:", err);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const metrics = [
    { value: stats.citizens, label: "Active Citizens" },
    { value: stats.wards, label: "Wards Covered" },
    { value: stats.resolved, label: "Issues Resolved" }
  ];

  return (
    <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden p-6 sm:p-10 lg:p-12 shadow-xs">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Architectural Ghats Sketch Illustration (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden">
              <img
                src={ghatsSketchImg}
                alt="Varanasi Ghats Architectural Sketch"
                className="h-full w-full object-cover mix-blend-multiply"
              />
            </div>
          </div>

          {/* RIGHT: Heading, Copy, 3 Stats (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 lg:pl-4">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#00A881]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A881]" />
              <span>A CLEANER TOMORROW</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#07111F]">
              Built by citizens. For better cities.
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              CivicConnect empowers people to take part in building cleaner, safer, and more livable cities. Together, we can create real change.
            </p>

            {/* 3 Stat Metrics with Chevrons (Matches Screenshot) */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#F1F5F9]">
              {metrics.map((m) => (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#07111F]">
                      {m.value}
                    </span>
                    <ChevronRight size={14} className="text-[#94A3B8] hidden sm:inline-block" />
                  </div>
                  <p className="text-xs text-[#64748B] font-medium">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
