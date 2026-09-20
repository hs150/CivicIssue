import { useState, useRef, useCallback } from "react";
import { ArrowLeftRight, Columns, SplitSquareVertical } from "lucide-react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Original Report (Before)",
  afterLabel = "Proof of Fix (After)",
  aspectRatio = "16/9"
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState("slider"); // "slider" or "split"
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full select-none">
      {/* Controls Bar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
          <ArrowLeftRight size={14} className="text-black dark:text-white" /> Interactive Proof Comparison
        </span>
        <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("slider")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
              viewMode === "slider" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <SplitSquareVertical size={13} /> Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
              viewMode === "split" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Columns size={13} /> Side-by-Side
          </button>
        </div>
      </div>

      {viewMode === "slider" ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 shadow-inner cursor-ew-resize touch-none"
          style={{ aspectRatio }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* AFTER Image (Full background) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          {/* BEFORE Image (Clipped on top) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute inset-0 h-full max-w-none object-cover"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
                height: "100%"
              }}
              draggable={false}
            />
          </div>

          {/* Vertical Divider Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-shadow"
            style={{ left: `calc(${sliderPosition}% - 2px)` }}
          >
            {/* Center Handle Knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black dark:bg-white text-white dark:text-black shadow-xl">
              <ArrowLeftRight size={15} />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-white/10">
            🔴 {beforeLabel}
          </div>
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
            ⚪ {afterLabel}
          </div>

          {/* Instruction helper */}
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md border border-white/10">
            Drag slider to inspect fix
          </div>
        </div>
      ) : (
        /* Side-by-Side View */
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900" style={{ aspectRatio }}>
            <img src={beforeImage} alt={beforeLabel} className="h-full w-full object-cover" />
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/10">
              🔴 {beforeLabel}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900" style={{ aspectRatio }}>
            <img src={afterImage} alt={afterLabel} className="h-full w-full object-cover" />
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
              ⚪ {afterLabel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
