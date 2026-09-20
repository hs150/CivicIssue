import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "../api.js";
import ghatsSketchImg from "../assets/varanasi_ghats_sketch.jpg";

export default function CitizensCityBanner() {
  const [stats, setStats] = useState({
    citizens: "0",
    wards: "Citywide",
    resolved: "0"
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          const totalReports = Number(data.stats.total ?? 0);
          const resolvedCount = Number(data.stats.resolved ?? 0);
          setStats({
            citizens: totalReports > 0 ? `${totalReports}` : "0",
            wards: "Citywide",
            resolved: `${resolvedCount}`
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
    { value: stats.citizens, label: "Citizen Reports" },
    { value: stats.wards, label: "Coverage" },
    { value: stats.resolved, label: "Issues Resolved" }
  ];

  return (
    <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden p-6 sm:p-10 lg:p-12 shadow-xs transition-colors">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Architectural Ghats Sketch Illustration (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <img
                src={ghatsSketchImg}
                alt="Varanasi Ghats Architectural Sketch"
                className="h-full w-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert dark:opacity-90 transition-all"
              />
            </div>
          </div>

          {/* RIGHT: Heading, Copy, 3 Stats (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 lg:pl-4">
            
            {/* Tag (Monochrome Black & White) */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 px-3 py-1 text-xs font-mono font-bold text-neutral-900 dark:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
              <span>A CLEANER TOMORROW</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
              Built by citizens. For better cities.
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
              CivicConnect empowers people to take part in building cleaner, safer, and more livable cities. Together, we can create real change.
            </p>

            {/* 3 Stat Metrics with Chevrons */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              {metrics.map((m) => (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
                      {m.value}
                    </span>
                    <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500 hidden sm:inline-block" />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
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
