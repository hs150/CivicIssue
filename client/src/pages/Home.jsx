import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

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
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    api.get("/issues/stats")
      .then(({ data }) => {
        if (isMounted && data?.stats) {
          setTotalCount(Number(data.stats.total ?? 0));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleScrollToMap = (e) => {
    e.preventDefault();
    const mapWidget = document.getElementById("hero-map-section");
    if (mapWidget) {
      mapWidget.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9F8] dark:bg-black text-[#07111F] dark:text-white selection:bg-neutral-800 selection:text-white space-y-16 sm:space-y-20 pb-20 transition-colors">
      
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
              <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                CLEANER CITIES . STRONGER COMMUNITIES.
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
                Report. Track. <br />
                <span className="text-black dark:text-white underline decoration-neutral-400 dark:decoration-neutral-600 underline-offset-4">Real Change.</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-md text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                CivicConnect helps citizens report civic issues, track their resolution, and build more transparent, accountable cities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={user ? "/report" : "/login"}
                  className="group inline-flex items-center gap-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-5 sm:px-6 py-3 font-bold transition shadow-xs active:scale-95 text-xs sm:text-sm"
                >
                  <span>Report an Issue</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#hero-map-section"
                  onClick={handleScrollToMap}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 sm:px-6 py-3 font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-2xs text-xs sm:text-sm"
                >
                  <span>View Live Map</span>
                </a>
              </div>

              {/* Social Proof Row: Avatars + Text */}
              <div className="pt-4 flex items-center gap-3">
                {/* 4 Overlapping Avatar Circles (Monochrome Black/White/Grey) */}
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-[10px] font-bold text-white dark:text-black ring-2 ring-white dark:ring-black shadow-xs" title="Citizen Contributor">
                    AM
                  </div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-bold text-white ring-2 ring-white dark:ring-black shadow-xs" title="Municipal Officer">
                    TO
                  </div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-black shadow-xs" title="Civic Contributor">
                    CC
                  </div>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-[10px] font-bold text-white dark:text-black ring-2 ring-white dark:ring-black shadow-xs">
                    {totalCount > 0 ? `+${totalCount}` : "LIVE"}
                  </div>
                </div>

                {/* Social Proof Text */}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  Real citizens reporting <br />
                  across smart city wards
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
