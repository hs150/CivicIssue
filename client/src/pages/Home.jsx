import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Sparkles, ShieldCheck, MapPin, Shield, 
  Layers, CheckCircle2, ChevronRight, Activity, Terminal
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

// Next-Gen Civic Intelligence Components
import HeroCityCanvas from "../components/HeroCityCanvas.jsx";
import CivicPulseSection from "../components/CivicPulseSection.jsx";
import CivicWorkflowSection from "../components/CivicWorkflowSection.jsx";
import AiAnalysisDemo from "../components/AiAnalysisDemo.jsx";
import CivicMapPreview from "../components/CivicMapPreview.jsx";
import IssueLifecycleTimeline from "../components/IssueLifecycleTimeline.jsx";
import CivicCommandCTA from "../components/CivicCommandCTA.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ========================================================================
          GLOBAL LAYERED BACKGROUND (Hero & Upper Atmosphere)
          Soft radial gradient: radial-gradient(circle at 50% 0%, #e8f8f4, #f7faf9 45%, #ffffff)
          with subtle grid patterns, low-opacity data lines, and radial lighting
      ======================================================================== */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 h-[1400px] w-full"
        style={{
          background: "radial-gradient(circle at 50% 0%, #e8f8f4 0%, #f7faf9 45%, #ffffff 100%)"
        }}
      />

      {/* Subtle technical grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 h-[1400px] w-full opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Low-opacity ambient geometric lighting */}
      <div className="pointer-events-none absolute top-[-100px] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-emerald-300/15 blur-[120px] z-0" />
      <div className="pointer-events-none absolute top-[300px] right-[-150px] h-[450px] w-[500px] rounded-full bg-cyan-300/15 blur-[100px] z-0" />

      {/* ========================================================================
          1. HERO SECTION (Light Rhythm)
          Left: Large Headline, Supporting Copy, Dual CTAs, Trust/Tech Badges
          Right: 3D Procedural Digital City Visualization & AI Micro-Card
      ======================================================================== */}
      <section className="relative z-10 pt-6 pb-16 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Hero Copy & Actions */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Trust & Architecture Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-2xs backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  CIVIC INTELLIGENCE PLATFORM
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/90 px-3 py-1 text-xs font-mono font-bold text-cyan-800 shadow-2xs backdrop-blur-xs">
                  <Sparkles size={11} className="text-cyan-600" />
                  GEMINI VISION 2.5
                </span>
              </div>

              {/* Core Hero Message */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-slate-950 leading-[1.08]">
                Report problems.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                  Verify fixes with AI.
                </span>{" "}
                Restore civic trust.
              </h1>

              {/* Supporting Description */}
              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
                An intelligent municipal command platform that unifies citizen issue reporting, real-time multimodal vision inspection, 500m geo-deduplication, and tamper-proof Before/After proof-of-fix verification.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={user ? "/report" : "/login"}
                  className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white shadow-xl shadow-slate-950/20 hover:bg-slate-900 transition-all active:scale-95"
                >
                  <span>Report an Issue</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                
                <Link
                  to="/issues"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/90 px-6 py-4 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition"
                >
                  <span>Explore Issues Map</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </Link>
              </div>

              {/* Trust & Technology Badges */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Before/After Anti-Fraud</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-cyan-600" />
                  <span>500m Proximity Clustering</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={16} className="text-teal-600" />
                  <span>Dynamic Route Optimizer</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Miniature Civic Intelligence 3D City */}
            <div className="lg:col-span-6 w-full">
              <HeroCityCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================
          2. LIVE CIVIC PULSE (White Rhythm)
          4 Synchronized Telemetry Counters & Hourly Velocity Histogram
      ======================================================================== */}
      <div className="relative z-10 py-10 bg-white border-y border-slate-100">
        <CivicPulseSection />
      </div>

      {/* ========================================================================
          3. CIVICCONNECT WORKFLOW (Light Rhythm)
          5-Stage Operational Pipeline with Dynamic SVG Connecting Lines
      ======================================================================== */}
      <div className="relative z-10 py-20 bg-slate-50/60">
        <CivicWorkflowSection />
      </div>

      {/* ========================================================================
          4. AI-POWERED CIVIC VERIFICATION (Dedicated Technical Scan Interface)
          Procedural Hazard Scanner, Laser Beam, Bounding Box HUD & 5-Step Sequence
      ======================================================================== */}
      <div className="relative z-10 py-20 bg-white border-t border-slate-100">
        <AiAnalysisDemo />
      </div>

      {/* ========================================================================
          5. LIVE CIVIC MAP (Dark Rhythm - Command Center Radar)
          Full-Featured Geospatial Radar, Active/Verified/Resolved Pins & Telemetry
      ======================================================================== */}
      <div className="relative z-10 py-20 bg-slate-950">
        <CivicMapPreview />
      </div>

      {/* ========================================================================
          6. ISSUE LIFECYCLE (White Rhythm)
          Horizontal Timeline with Timestamps (10:32 -> 13:16) & Cryptographic Audit
      ======================================================================== */}
      <div className="relative z-10">
        <IssueLifecycleTimeline />
      </div>

      {/* ========================================================================
          7. COMMAND-CENTER CTA (Dark Rhythm)
          "YOUR CITY. YOUR VOICE." with City Skyline Silhouette & Live Stats
      ======================================================================== */}
      <div className="relative z-10 py-20 bg-slate-900/40">
        <CivicCommandCTA />
      </div>

    </div>
  );
}
