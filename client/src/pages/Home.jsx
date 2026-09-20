import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

// Precision Components Matching the Reference Design
import HeroMapWidget from "../components/HeroMapWidget.jsx";
import CivicPulseSection from "../components/CivicPulseSection.jsx";
import CivicWorkflowSection from "../components/CivicWorkflowSection.jsx";
import RecentIssuesSection from "../components/RecentIssuesSection.jsx";
import AiAnalysisDemo from "../components/AiAnalysisDemo.jsx";
import IssueLifecycleTimeline from "../components/IssueLifecycleTimeline.jsx";
import CitizensCityBanner from "../components/CitizensCityBanner.jsx";
import CivicCommandCTA from "../components/CivicCommandCTA.jsx";

export default function Home() {
  const { user } = useAuth();

  const handleScrollToMap = (e) => {
    e.preventDefault();
    const mapWidget = document.getElementById("hero-map-section");
    if (mapWidget) {
      mapWidget.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9F8] text-[#07111F] selection:bg-[#00A881]/20 selection:text-[#00A881] space-y-16 sm:space-y-20 pb-20">
      
      {/* ========================================================================
          1. HERO SECTION (Exact Match to Screenshot)
          Left: Kicker, "Report. Track. Real Change.", Subtitle, Dual CTAs, Social Proof
          Right: HeroMapWidget (Varanasi vector map, category breakdown, pins, card)
      ======================================================================== */}
      <section className="pt-6 sm:pt-10 md:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Category Kicker */}
              <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#00A881] uppercase">
                CLEANER CITIES . STRONGER COMMUNITIES.
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#07111F] leading-[1.12]">
                Report. Track. <br />
                <span className="text-[#00A881]">Real Change.</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-md text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                CivicConnect helps citizens report civic issues, track their resolution, and build more transparent, accountable cities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={user ? "/report" : "/login"}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#00A881] hover:bg-[#008F70] px-5 sm:px-6 py-3 font-bold text-white transition shadow-xs active:scale-95 text-xs sm:text-sm"
                >
                  <span>Report an Issue</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#hero-map-section"
                  onClick={handleScrollToMap}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-5 sm:px-6 py-3 font-bold text-[#07111F] hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs text-xs sm:text-sm"
                >
                  <span>View Live Map</span>
                </a>
              </div>

              {/* Social Proof Row: Avatars + Text */}
              <div className="pt-4 flex items-center gap-3">
                {/* 4 Overlapping Avatar Circles */}
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face"
                    alt="Citizen Avatar"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                    alt="Citizen Avatar"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face"
                    alt="Citizen Avatar"
                  />
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00A881] text-[10px] font-bold text-white ring-2 ring-white">
                    +10K
                  </div>
                </div>

                {/* Social Proof Text */}
                <p className="text-[11px] text-[#64748B] leading-tight">
                  Trusted by 10,000+ citizens <br />
                  across smart cities
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Vector Map Widget */}
            <div id="hero-map-section" className="lg:col-span-7 w-full scroll-mt-24">
              <HeroMapWidget />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================
          2. LIVE CIVIC PULSE (Header + 4 Stat Cards)
      ======================================================================== */}
      <div>
        <CivicPulseSection />
      </div>

      {/* ========================================================================
          3. HOW CIVICCONNECT WORKS (5 Step Cards Connected with Arrows)
      ======================================================================== */}
      <div>
        <CivicWorkflowSection />
      </div>

      {/* ========================================================================
          4. RECENT ISSUES (Grid of 4 Cards: Pothole, Street Light, Waste, Water)
      ======================================================================== */}
      <div>
        <RecentIssuesSection />
      </div>

      {/* ========================================================================
          5. VERIFIED ISSUES. REAL ACTION. (Dark AI Verification Section)
      ======================================================================== */}
      <div>
        <AiAnalysisDemo />
      </div>

      {/* ========================================================================
          6. TRACK AN ISSUE (Timeline + Repaired Issue Details Card)
      ======================================================================== */}
      <div>
        <IssueLifecycleTimeline />
      </div>

      {/* ========================================================================
          7. BUILT BY CITIZENS. FOR BETTER CITIES. (Heritage Sketch Banner)
      ======================================================================== */}
      <div>
        <CitizensCityBanner />
      </div>

      {/* ========================================================================
          8. BE THE CHANGE - YOUR CITY. YOUR VOICE. (Night Ghats Panorama CTA)
      ======================================================================== */}
      <div>
        <CivicCommandCTA />
      </div>

    </div>
  );
}
