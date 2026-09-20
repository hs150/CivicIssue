import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, dur) => showToast(msg, "success", dur), [showToast]);
  const error = useCallback((msg, dur) => showToast(msg, "error", dur), [showToast]);
  const warning = useCallback((msg, dur) => showToast(msg, "warning", dur), [showToast]);
  const info = useCallback((msg, dur) => showToast(msg, "info", dur), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bg = "bg-slate-900 text-white border-slate-700";
          let icon = <Info className="text-blue-400 shrink-0" size={18} />;

          if (toast.type === "success") {
            bg = "bg-black text-white border-neutral-700 shadow-2xl dark:bg-white dark:text-black dark:border-neutral-300";
            icon = <CheckCircle2 className="text-white dark:text-black shrink-0" size={18} />;
          } else if (toast.type === "error") {
            bg = "bg-rose-950/95 text-rose-100 border-rose-700/60 shadow-rose-950/20";
            icon = <XCircle className="text-rose-400 shrink-0" size={18} />;
          } else if (toast.type === "warning") {
            bg = "bg-amber-950/95 text-amber-100 border-amber-700/60 shadow-amber-950/20";
            icon = <AlertTriangle className="text-amber-400 shrink-0" size={18} />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {icon}
                <span className="font-medium text-xs sm:text-sm leading-snug break-words">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
