import { useState } from "react";
import { MapPin, Navigation, Plus, Minus, ArrowRight, Clock } from "lucide-react";
import potholeImg from "../assets/pothole_main_road.jpg";

export default function HeroMapWidget() {
  const [selectedPin, setSelectedPin] = useState(0);

  const pins = [
    { id: 0, x: 58, y: 64, color: "#EF4444", title: "Pothole on Main Road", priority: "High", location: "Lanka, Varanasi", time: "2 hours ago" },
    { id: 1, x: 68, y: 38, color: "#EF4444", title: "Traffic Signal Outage", priority: "High", location: "Godowlia, Varanasi", time: "3 hours ago" },
    { id: 2, x: 42, y: 46, color: "#00A881", title: "Public Park Cleaned", priority: "Resolved", location: "Sigra, Varanasi", time: "4 hours ago" },
    { id: 3, x: 78, y: 52, color: "#F59E0B", title: "Garbage Overflow", priority: "Medium", location: "Assi Ghat, Varanasi", time: "5 hours ago" },
    { id: 4, x: 88, y: 68, color: "#EF4444", title: "Open Drain Hazard", priority: "High", location: "Samne Ghat, Varanasi", time: "6 hours ago" },
    { id: 5, x: 50, y: 22, color: "#3B82F6", title: "Main Pipe Burst", priority: "High", location: "Cantonment, Varanasi", time: "1 hour ago" },
  ];

  const currentPin = pins[selectedPin] || pins[0];

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-900/5 select-none overflow-hidden">
      
      {/* Top Bar of Map Widget (Matches Screenshot) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
        {/* City Dropdown Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#07111F] shadow-2xs">
          <MapPin size={13} className="text-[#00A881]" />
          <span>Varanasi</span>
          <span className="text-[10px] text-[#94A3B8]">▾</span>
        </div>

        {/* Category Breakdown (Roads 28, Water 16, Waste 12, Lighting 9, Others 5) */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span>Roads</span> <strong className="text-[#07111F]">28</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span>Water</span> <strong className="text-[#07111F]">16</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>Waste</span> <strong className="text-[#07111F]">12</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
            <span>Lighting</span> <strong className="text-[#07111F]">9</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />
            <span>Others</span> <strong className="text-[#07111F]">5</strong>
          </span>
        </div>
      </div>

      {/* Stylized Vector City Map Canvas */}
      <div className="relative mt-3 h-[300px] sm:h-[350px] w-full rounded-xl sm:rounded-2xl bg-[#EBF4EC] overflow-hidden border border-[#E2E8F0]">
        
        {/* River (Winding Ganges River in Light Blue) */}
        <svg
          viewBox="0 0 600 400"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Base River Path */}
          <path
            d="M 380 -20 Q 320 80, 360 160 T 480 260 Q 560 330, 480 420 L 620 420 L 620 -20 Z"
            fill="#BAE6FD"
            opacity="0.85"
          />
          {/* Inner River Wave Depth */}
          <path
            d="M 400 -20 Q 340 80, 380 160 T 500 260 Q 570 330, 500 420 L 620 420 L 620 -20 Z"
            fill="#93C5FD"
            opacity="0.45"
          />

          {/* Road Network Over Land */}
          <path d="M 0 100 L 370 140" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M 0 100 L 370 140" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          <path d="M 0 240 L 460 250" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
          <path d="M 0 240 L 460 250" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          <path d="M 160 0 L 160 400" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          <path d="M 160 0 L 160 400" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          <path d="M 280 0 L 280 400" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          <path d="M 280 0 L 280 400" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

          {/* Bridge Crossing the River */}
          <path d="M 350 150 L 430 180" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="square" />
          <path d="M 350 150 L 430 180" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="square" />

          {/* Green Parks / Open Spaces */}
          <rect x="40" y="30" width="80" height="50" rx="8" fill="#DCFCE7" />
          <rect x="180" y="160" width="70" height="60" rx="10" fill="#DCFCE7" />
          <rect x="50" y="270" width="90" height="70" rx="12" fill="#DCFCE7" />
        </svg>

        {/* Map Pins */}
        {pins.map((pin, idx) => {
          const isSelected = selectedPin === idx;
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(idx)}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 z-10 ${
                isSelected ? "scale-125 z-20" : "hover:scale-110"
              }`}
              title={pin.title}
            >
              {isSelected && (
                <span
                  className="absolute -inset-1.5 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: pin.color }}
                />
              )}
              <div
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-white shadow-md text-white"
                style={{ backgroundColor: pin.color }}
              >
                <MapPin size={13} fill="currentColor" />
              </div>
            </button>
          );
        })}

        {/* Floating Active Issue Card (Exact match to screenshot) */}
        <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-20 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-md max-w-[280px] sm:max-w-[310px]">
          {/* Thumbnail */}
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
            <img src={potholeImg} alt="Pothole" className="h-full w-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[#07111F] truncate">
                {currentPin.title}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-[#EF4444] shrink-0 border border-rose-100">
                <span className="h-1 w-1 rounded-full bg-[#EF4444]" /> {currentPin.priority}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-[#64748B] flex items-center gap-1 truncate">
              <MapPin size={10} className="text-[#94A3B8] shrink-0" />
              <span>{currentPin.location}</span>
            </p>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                <Clock size={10} /> {currentPin.time}
              </span>
              <span className="text-xs font-bold text-[#00A881] hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>

        {/* Map Zoom Controls on Right (Matches Screenshot) */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col rounded-xl border border-[#E2E8F0] bg-white shadow-md overflow-hidden text-[#64748B]">
          <button className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition border-b border-slate-100">
            <Plus size={13} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition border-b border-slate-100">
            <Minus size={13} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition text-[#00A881]">
            <Navigation size={12} />
          </button>
        </div>

      </div>

    </div>
  );
}
