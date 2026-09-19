import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, MapPin, Zap, FastForward, Radio, Volume2, VolumeX } from "lucide-react";

export default function CinematicEntryScene({ onComplete, autoPlay = true }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0: Init/Beam, 1: Holographic Shield, 2: Title Reveal, 3: Telemetry Boot, 4: Iris Out
  const [isMuted, setIsMuted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const bootSteps = [
    { threshold: 15, text: "SPATIAL GRID INITIALIZED: SECTOR 4 & 9", icon: MapPin },
    { threshold: 45, text: "GEMINI MULTIMODAL VISION MODEL: ONLINE", icon: Zap },
    { threshold: 75, text: "CITIZEN COMMUNITY CONSENSUS PROTOCOL: SYNCED", icon: ShieldCheck },
    { threshold: 95, text: "CIVICCONNECT MUNICIPAL PLATFORM: READY", icon: Sparkles }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    // Progress counter timer: 0 to 100 over ~4.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [autoPlay]);

  // Phase synchronization
  useEffect(() => {
    if (progress < 25) setPhase(0);
    else if (progress < 50) setPhase(1);
    else if (progress < 85) setPhase(2);
    else if (progress < 99) setPhase(3);
    else setPhase(4);
  }, [progress]);

  // Keyboard shortcut: ESC or ENTER to skip
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" || e.key === "Enter") {
        handleFinish();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleFinish() {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between bg-slate-950 text-white font-sans transition-all duration-700 select-none overflow-hidden ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* BACKGROUND COSMOS & GRID */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 cinematic-grid opacity-30" />

        {/* Ambient Pulsing Radial Orbs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl animate-float" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl animate-pulse-glow" />

        {/* Anamorphic Blue-Green Light Streak */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_rgba(52,211,153,0.9)] animate-beam pointer-events-none" />

        {/* Film Grain & Scanline Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)"
          }}
        />
      </div>

      {/* CINEMATIC TOP LETTERBOX BAR */}
      <header className="relative z-20 flex h-14 sm:h-16 items-center justify-between border-b border-emerald-900/40 bg-black/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase hidden sm:inline">
            REC ● 4K 60FPS // CIVIC_CORE_STREAM
          </span>
          <span className="text-xs font-mono tracking-wider text-emerald-400/90 sm:hidden">
            REC ● CIVICCONNECT
          </span>
        </div>

        {/* Audio Waveform Simulator */}
        <div className="hidden md:flex items-center gap-1.5 px-4 py-1 rounded-full bg-slate-900/80 border border-slate-800">
          <div className="h-3 w-0.5 bg-emerald-500 animate-pulse" />
          <div className="h-5 w-0.5 bg-emerald-400 animate-pulse delay-75" />
          <div className="h-2 w-0.5 bg-emerald-500 animate-pulse delay-150" />
          <div className="h-6 w-0.5 bg-teal-400 animate-pulse delay-100" />
          <div className="h-4 w-0.5 bg-emerald-400 animate-pulse delay-200" />
          <div className="h-2 w-0.5 bg-emerald-600 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-400 ml-2">AUDIO VISUALIZER ACTIVE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleFinish}
            className="group flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-800/60 px-4 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            <span>Skip Intro</span>
            <FastForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
            <kbd className="hidden sm:inline-block ml-1 rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400 font-mono">ESC</kbd>
          </button>
        </div>
      </header>

      {/* CENTER CINEMATIC STAGE */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Holographic Gyro / Radar Rings */}
        <div className="relative mb-8 grid place-items-center">
          {/* Outer Radar Ring */}
          <div className="absolute h-44 w-44 sm:h-56 sm:w-56 rounded-full border border-emerald-500/30 border-dashed animate-radar" />
          {/* Middle Pulse Ring */}
          <div className="absolute h-36 w-36 sm:h-44 sm:w-44 rounded-full border border-teal-400/40 animate-pulse-glow" />
          {/* Coordinate Marks */}
          <div className="absolute -top-6 text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">
            LAT 28.6139° N • LON 77.2090° E
          </div>
          <div className="absolute -bottom-6 text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
            CIVIC INTELLIGENCE ENGINE V2.4
          </div>

          {/* Center Glowing Emblem */}
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 p-[2px] shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950/90 backdrop-blur-md">
              <ShieldCheck size={52} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
            </div>
            {/* Sparkle badge */}
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50">
              <Sparkles size={13} />
            </span>
          </div>
        </div>

        {/* Kinetic Title Reveal */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-4 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-4 shadow-sm">
            <Radio size={12} className="animate-ping text-emerald-400" />
            <span>MUNICIPAL TRANSPARENCY PROTOCOL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            <span className="text-white">CIVIC</span>
            <span className="text-shimmer ml-3">CONNECT</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
            AI-Powered Municipal Diagnostics • Community Verified Resolutions • Forensic Audit Ledger
          </p>
        </div>

        {/* Live Telemetry Progress Bar & Log */}
        <div className="mt-10 w-full max-w-md">
          {/* Digital Percentage & Status */}
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              {progress < 100 ? "INITIALIZING SUBSYSTEMS..." : "ALL SYSTEMS OPERATIONAL"}
            </span>
            <span className="text-xl font-black font-mono text-emerald-300">{progress}%</span>
          </div>

          {/* High-Tech Progress Bar */}
          <div className="relative h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(52,211,153,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Console Ticker */}
          <div className="mt-4 h-8 flex items-center justify-center">
            {bootSteps.map((step, idx) => {
              const isCurrent = progress >= (idx === 0 ? 0 : bootSteps[idx - 1].threshold) && progress <= step.threshold + 20;
              if (!isCurrent) return null;
              const Icon = step.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Icon size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{step.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* CINEMATIC BOTTOM LETTERBOX BAR */}
      <footer className="relative z-20 flex h-14 sm:h-16 items-center justify-between border-t border-emerald-900/40 bg-black/90 px-6 backdrop-blur-md text-xs font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span>PROJECT: CIVICCONNECT</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">ARCHITECTURE: POSTGRES + REACT 19 + AI VISION</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>PRESS</span>
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-slate-700">ENTER</kbd>
          <span className="hidden sm:inline">OR ESC TO ENTER DASHBOARD</span>
        </div>
      </footer>
    </div>
  );
}
