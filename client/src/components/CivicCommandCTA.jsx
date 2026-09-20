import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import nightGhatsImg from "../assets/city_ghats_night_panorama.jpg";

export default function CivicCommandCTA() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#06101E] text-white p-8 sm:p-12 lg:p-14 shadow-2xl border border-slate-800">
        
        {/* Background Image: Night Ghats Panorama with dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={nightGhatsImg}
            alt="City Skyline"
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06101E] via-[#06101E]/80 to-transparent" />
        </div>

        {/* Content Row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Text */}
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#94A3B8] uppercase">
              BE THE CHANGE
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Your City. Your Voice.
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-1">
              Report civic issues, track progress, and make your city a better place.
            </p>
          </div>

          {/* Right Button */}
          <div className="shrink-0">
            <Link
              to={user ? "/report" : "/login"}
              className="inline-flex items-center gap-2 rounded-full bg-[#00C896] hover:bg-[#008F70] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#06101E] hover:text-white transition shadow-lg active:scale-95"
            >
              <span>Report an Issue</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
