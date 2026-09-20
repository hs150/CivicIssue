import { useState } from "react";
import { Palette, Check, Moon, Sun, X, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeSelector({ showButton = true, showFloating = true }) {
  const { theme, setTheme, themes, activeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dockMinimized, setDockMinimized] = useState(false);

  return (
    <>
      {/* 1. NAVBAR THEME TRIGGER BUTTON */}
      {showButton && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
        title={`Current Theme: ${activeTheme.name}`}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer shadow-xs backdrop-blur-sm"
      >
        <span
          className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
          style={{ backgroundColor: activeTheme.primaryColor }}
        />
        <Palette size={14} className="text-slate-500" />
        <span className="hidden sm:inline">Theme</span>
      </button>
      )}

      {/* 2. THEME STUDIO MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-800">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Theme Studio</h3>
                  <p className="text-xs text-slate-500">Personalize your CivicConnect visual experience</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Theme Cards Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {themes.map((t) => {
                const isSelected = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-neutral-100 shadow-md ring-2 ring-black/20 dark:border-white dark:bg-neutral-800 dark:ring-white/20"
                        : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-xs border border-neutral-300 dark:border-neutral-700"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</span>
                        </div>

                        {isSelected && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {t.subtitle}
                      </p>
                    </div>

                    {/* Preview Swatches & Mode Tag */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        {t.swatches.map((color, idx) => (
                          <span
                            key={idx}
                            className="h-3 w-3 rounded-full border border-slate-300/60 shadow-2xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-black px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800 shadow-2xs">
                        {t.mode === "dark" ? <Moon size={10} /> : <Sun size={10} />}
                        <span>{t.mode === "dark" ? "Dark" : "Light"}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer tip */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Sparkles size={13} className="text-black dark:text-white" />
                <span>Theme preference is saved to your browser automatically.</span>
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-black dark:bg-white px-4 py-2 font-bold text-white dark:text-black text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLOATING QUICK-SWITCHER DOCK (Bottom-right on all pages) */}
      {showFloating && (
        <aside aria-label="Quick theme switcher" className="fixed bottom-6 right-6 z-[8000] animate-fadeIn">
          {dockMinimized ? (
            <button
              type="button"
              onClick={() => setDockMinimized(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-xl hover:scale-105 transition cursor-pointer"
              title="Open Quick Theme Switcher"
            >
              <Palette size={18} className="text-slate-700" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md transition-all">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer pr-1"
                title="Open Theme Studio"
              >
                <Palette size={15} className="text-slate-600" />
                <span className="hidden md:inline font-mono text-[11px]">THEME</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              {/* Swatch dots for immediate 1-click theme swap */}
              <div className="flex items-center gap-1.5">
                {themes.map((t) => {
                  const isSelected = t.id === theme;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      title={`Switch to ${t.name}`}
                      className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-115 cursor-pointer ${
                        isSelected ? "ring-2 ring-offset-2 ring-slate-800 scale-105" : "opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: t.primaryColor }}
                    >
                      {isSelected && (
                        <Check
                          size={11}
                          className={t.primaryColor === "#FFFFFF" ? "text-black drop-shadow-xs" : "text-white drop-shadow-xs"}
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setDockMinimized(true)}
                className="ml-1 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Minimize Theme Dock"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
