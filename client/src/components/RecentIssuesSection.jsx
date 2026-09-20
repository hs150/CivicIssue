import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { api } from "../api.js";

// Generated assets matching the screenshot
import potholeImg from "../assets/pothole_main_road.jpg";
import streetLightImg from "../assets/street_light_night.jpg";
import garbageImg from "../assets/garbage_overflow_bins.jpg";
import waterLeakImg from "../assets/water_leakage_street.jpg";

export default function RecentIssuesSection() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          setIssues(data.issues.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load recent issues:", err);
      }
    }
    loadIssues();
    return () => { isMounted = false; };
  }, []);

  // Default fallback matching exact screenshot cards
  const defaultCards = [
    {
      id: "cc-45821",
      code: "#CC-45821",
      title: "Pothole on Main Road",
      location: "Lanka, Varanasi",
      time: "2 hours ago",
      category: "Roads",
      priority: "High",
      badgeBg: "bg-rose-50 text-[#EF4444] border-rose-200",
      dotColor: "bg-[#EF4444]",
      image: potholeImg
    },
    {
      id: "cc-45820",
      code: "#CC-45820",
      title: "Street Light Not Working",
      location: "BHU, Varanasi",
      time: "5 hours ago",
      category: "Lighting",
      priority: "Medium",
      badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
      dotColor: "bg-amber-500",
      image: streetLightImg
    },
    {
      id: "cc-45819",
      code: "#CC-45819",
      title: "Garbage Overflowing",
      location: "Assi, Varanasi",
      time: "1 day ago",
      category: "Waste",
      priority: "Medium",
      badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
      dotColor: "bg-amber-500",
      image: garbageImg
    },
    {
      id: "cc-45818",
      code: "#CC-45818",
      title: "Water Leakage",
      location: "Ravindrapuri, Varanasi",
      time: "1 day ago",
      category: "Water",
      priority: "Low",
      badgeBg: "bg-emerald-50 text-[#00A881] border-emerald-200",
      dotColor: "bg-[#00A881]",
      image: waterLeakImg
    }
  ];

  const displayCards = defaultCards.map((def, idx) => {
    const real = issues[idx];
    if (real) {
      return {
        ...def,
        id: real.id,
        code: real.issueCode ? `#${real.issueCode}` : def.code,
        title: real.title || def.title,
        location: real.address || def.location,
        category: real.category || def.category,
        priority: real.priority ? real.priority.charAt(0).toUpperCase() + real.priority.slice(1).toLowerCase() : def.priority,
        image: real.imageUrl ? (real.imageUrl.startsWith("http") ? real.imageUrl : `http://localhost:5000${real.imageUrl}`) : def.image
      };
    }
    return def;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
            Recent Issues
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            See what's happening in your city.
          </p>
        </div>

        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#07111F] hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
        >
          <span>View All Issues</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCards.map((card) => (
          <Link
            key={card.id}
            to={`/issues/${card.id}`}
            className="group flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs hover:border-[#00A881]/50 hover:shadow-md transition-all"
          >
            <div>
              {/* Image with Priority Badge */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Priority Tag Pill on top right */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border backdrop-blur-md bg-white/90 ${card.badgeBg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${card.dotColor}`} />
                    <span>{card.priority}</span>
                  </span>
                </div>
              </div>

              {/* Title & Location */}
              <div className="p-4 pb-2">
                <h3 className="text-sm font-bold text-[#07111F] group-hover:text-[#00A881] transition line-clamp-1">
                  {card.title}
                </h3>
                
                <p className="mt-1 text-xs text-[#64748B] flex items-center gap-1 truncate">
                  <MapPin size={12} className="text-[#94A3B8] shrink-0" />
                  <span>{card.location}</span>
                </p>

                <p className="mt-1 text-[11px] text-[#94A3B8] flex items-center gap-1">
                  <Clock size={11} />
                  <span>{card.time}</span>
                </p>
              </div>
            </div>

            {/* Bottom Footer: Category & Code */}
            <div className="px-4 py-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                {card.category}
              </span>
              <span className="text-[11px] font-semibold text-[#94A3B8]">
                {card.code}
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
