import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Sparkles, ShieldCheck, MapPin, Shield, 
  Activity, Clock, CheckCircle2, ChevronRight, MapPinned
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

// Enterprise Civic Intelligence Components
import HeroCityCanvas from "../components/HeroCityCanvas.jsx";
import CivicPulseSection from "../components/CivicPulseSection.jsx";
import CivicWorkflowSection from "../components/CivicWorkflowSection.jsx";
import AiAnalysisDemo from "../components/AiAnalysisDemo.jsx";
import CivicMapPreview from "../components/CivicMapPreview.jsx";
import IssueLifecycleTimeline from "../components/IssueLifecycleTimeline.jsx";
import CivicCommandCTA from "../components/CivicCommandCTA.jsx";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 2481,
    aiVerifiedPct: 94,
    avgResolutionHours: 24
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const { data } = await api.get("/issues/stats");
        if (isMounted && data?.stats) {
          setStats({
            total: data.stats.total || 2481,
            aiVerifiedPct: data.stats.aiVerifiedPct || 94,
            avgResolutionHours: data.stats.avgResolutionHours || 24
          });
        }
      } catch (err) {
        console.error("Failed to load hero metrics:", err);
      }
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const handleScrollToMap = (e) => {
    e.preventDefault();
    const mapEl = document.getElementById("civic-map");
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9F8] text-[#07111F] selection:bg-[#00C896]/20 selection:text-[#008F70]">
      
      {/* ========================================================================
          1. HERO SECTION
          Two-column high-density layout
          Left: Small badge, editorial headline, supporting text, dual CTAs, trust metrics
          Right: Interactive civic intelligence dashboard / 3D radar canvas
      ======================================================================== */}
      <section className="relative z-10 pt-8 pb-14 md:pt-14 md:pb-20 border-b border-[#DDE5E1]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Hero Copy & Actions */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Small Badge: LIVE CIVIC INTELLIGENCE */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 px-3 py-1 text-xs font-mono font-bold text-[#008F70]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C896] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C896]" />
                </span>
                <span>LIVE CIVIC INTELLIGENCE</span>
              </div>

              {/* Large Headline: "Your city has problems. Now it can see them." */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#07111F] leading-[1.12]">
                Your city has problems. <br />
                <span className="text-[#00C896]">Now it can see them.</span>
              </h1>

              {/* Supporting Text */}
              <p className="max-w-xl text-base sm:text-lg text-[#64748B] leading-relaxed font-normal">
                Report civic issues, verify evidence with AI, and track every resolution from report to repair.
              </p>

              {/* Dual CTA Buttons: Report an Issue →, Explore Live Map */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to={user ? "/report" : "/login"}
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#00C896] hover:bg-[#008F70] px-6 py-3.5 font-bold text-[#020817] hover:text-white transition shadow-sm active:scale-95 text-sm sm:text-base"
                >
                  <span>Report an Issue</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                
                <a
                  href="#civic-map"
                  onClick={handleScrollToMap}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#DDE5E1] bg-white px-6 py-3.5 font-bold text-[#07111F] hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs text-sm sm:text-base"
                >
                  <MapPinned size={17} className="text-[#008F70]" />
                  <span>Explore Live Map</span>
                </a>
              </div>

              {/* Small Trust Metrics: 2,481 Issues Tracked, 94% AI Verified, <24h Average Response */}
              <div className="pt-6 border-t border-[#DDE5E1] grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#07111F]">
                    {stats.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">
                    Issues Tracked
                  </div>
                </div>

                <div className="border-l border-[#DDE5E1] pl-4">
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#008F70]">
                    {stats.aiVerifiedPct}%
                  </div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">
                    AI Verified
                  </div>
                </div>

                <div className="border-l border-[#DDE5E1] pl-4">
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#07111F]">
                    &lt;24h
                  </div>
                  <div className="text-xs text-[#64748B] font-medium mt-0.5">
                    Average Response
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Civic Intelligence Map / Dashboard */}
            <div className="lg:col-span-6 w-full">
              <HeroCityCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================
          2. LIVE CIVIC PULSE SECTION
          Real-time metrics: Total Reports, Active Issues, AI Verified, Avg Response Time,
          Activity graph, and Last Updated indicator.
      ======================================================================== */}
      <div className="relative z-10 py-14 sm:py-16">
        <CivicPulseSection />
      </div>

      {/* ========================================================================
          3. HOW CIVICCONNECT WORKS
          5-step horizontal operational process:
          01 Report, 02 AI Inspection, 03 Evidence Verification, 04 Officer Action, 05 Citizen Resolution
      ======================================================================== */}
      <div className="relative z-10 py-14 sm:py-16 bg-[#F7F9F8] border-t border-[#DDE5E1]">
        <CivicWorkflowSection />
      </div>

      {/* ========================================================================
          4. AI VERIFICATION (High-Impact Deep Navy Section)
          "AI doesn't just analyze reports. It verifies them."
          Split screen with live evidence scanner & AI Evidence Analysis panel:
          Damage detected ✓, Location verified ✓, Timestamp valid ✓, Duplicate check ✓, Trust Score 98.7%
      ======================================================================== */}
      <div className="relative z-10">
        <AiAnalysisDemo />
      </div>

      {/* ========================================================================
          5. CIVIC ISSUES MAP
          Full-width interactive geospatial section with category filters:
          All, Road, Water, Waste, Lighting, colored severity markers & details card.
      ======================================================================== */}
      <div className="relative z-10 py-14 sm:py-16">
        <CivicMapPreview />
      </div>

      {/* ========================================================================
          6. ISSUE LIFECYCLE
          5-Stage tracking timeline: Submitted, AI Verified, Officer Assigned,
          Work In Progress, Resolved with side-by-side details card.
      ======================================================================== */}
      <div className="relative z-10 py-14 sm:py-16 border-t border-[#DDE5E1]">
        <IssueLifecycleTimeline />
      </div>

      {/* ========================================================================
          7. FINAL CTA
          "YOUR CITY. YOUR VOICE."
          "Turn a report into a verified action."
          Buttons: Report an Issue →, Explore the Map
      ======================================================================== */}
      <div className="relative z-10 py-14 sm:py-16">
        <CivicCommandCTA />
      </div>

    </div>
  );
}
