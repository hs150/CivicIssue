import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Maximize2, ArrowRight } from "lucide-react";
import potholeImg from "../assets/pothole_main_road.jpg";

export default function AiAnalysisDemo() {
  const [fullscreen, setFullscreen] = useState(false);

  const checklist = [
    { id: 1, title: "Image analysis", desc: "Issue detected in image" },
    { id: 2, title: "Location match", desc: "GPS coordinates verified" },
    { id: 3, title: "Duplicate check", desc: "No similar report found" },
    { id: 4, title: "Timestamp valid", desc: "Image is recent" }
  ];

  return (
    <section id="ai-verification" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Dark Navy Full Container (Matches Screenshot) */}
      <div className="rounded-3xl bg-[#06101E] text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-slate-800 relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN (4 Cols): Headline, Copy, Learn More Button */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Pill: VERIFICATION */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-bold text-[#00C896]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C896]" />
              <span>VERIFICATION</span>
            </div>

            {/* Headline: Verified Issues. Real Action. */}
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Verified Issues. <br />
              <span className="text-[#00C896]">Real Action.</span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              We use advanced verification checks to ensure reported issues are genuine, accurate, and actionable — no fake reports, no noise.
            </p>

            {/* Learn More Button */}
            <div className="pt-2">
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 rounded-full bg-[#00C896] hover:bg-[#008F70] px-5 py-2.5 text-xs font-bold text-[#06101E] hover:text-white transition shadow-sm"
              >
                <span>Learn More</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* CENTER COLUMN (5 Cols): Image with Bounding Box & "Pothole detected" */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl group">
              
              {/* Evidence Pothole Photo */}
              <img
                src={potholeImg}
                alt="AI Pothole Inspection"
                className="h-full w-full object-cover"
              />

              {/* Cyan / Teal Bounding Box (Matches Screenshot) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 sm:w-56 h-28 sm:h-36 rounded-xl border-2 border-[#00C896] bg-[#00C896]/10 flex items-center justify-center pointer-events-none shadow-[0_0_15px_rgba(0,200,150,0.25)]">
                <span className="rounded-md bg-[#06101E]/90 border border-[#00C896]/60 px-2.5 py-1 text-[11px] font-mono font-bold text-white shadow-md">
                  Pothole detected
                </span>
              </div>

              {/* Fullscreen Expand Icon on Top Right */}
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs"
                title="Expand View"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (3 Cols): 4 Verification Checks + Score */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 4 Checklist Items with Green Check Circles */}
            <div className="space-y-3.5">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00C896] text-[#06101E]">
                    <Check size={10} strokeWidth={3.5} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Score Box */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">
                Verification score
              </span>
              <div className="mt-1 text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                98.7%
              </div>
              
              {/* Green Progress Bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#00C896] w-[98.7%]" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
