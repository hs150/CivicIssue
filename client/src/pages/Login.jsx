import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Activity,
  Zap
} from "lucide-react";

export default function Login({ initialMode = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [roleTab, setRoleTab] = useState("citizen"); // 'citizen' | 'officer'
  const [form, setForm] = useState({
    name: "",
    email: "citizen@civicconnect.demo",
    password: "Demo@123"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick 1-click Demo Account Switcher
  function applyDemo(role) {
    setRoleTab(role);
    setError("");
    if (role === "citizen") {
      setForm((prev) => ({
        ...prev,
        email: "citizen@civicconnect.demo",
        password: "Demo@123"
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        email: "officer@civicconnect.demo",
        password: "Demo@123"
      }));
    }
  }

  // Instant 1-Click Login for Hackathon Judges & Evaluators
  async function instantDemoLogin(role) {
    setError("");
    setLoading(true);
    const demoEmail = role === "officer" ? "officer@civicconnect.demo" : "citizen@civicconnect.demo";
    const demoPass = "Demo@123";
    try {
      const user = await login(demoEmail, demoPass);
      const target = location.state?.from || (user.role === "citizen" ? "/" : "/dashboard");
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register(form.name, form.email, form.password);
        navigate("/");
      } else {
        const user = await login(form.email, form.password);
        const target = location.state?.from || (user.role === "citizen" ? "/" : "/dashboard");
        navigate(target);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-slate-100 flex items-center justify-center">

      {/* BACKGROUND PARTICLES & GLOW AMBIANCE */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cinematic-grid opacity-25" />
        <div className="absolute top-10 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-12">
        {/* =========================================================
            LEFT COLUMN: CIVIC COMMAND VISUAL DISPLAY & VIDEO TRIGGER
        ========================================================= */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl lg:col-span-6">
          <div>
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>CIVICCONNECT SMART OS • LIVE</span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Transparent Cities. <br />
              <span className="text-shimmer">Citizen Verified.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed font-light">
              Join thousands of residents transforming urban infrastructure. Report issues, track municipal repairs with Gemini AI Vision, and certify resolutions on a public audit trail.
            </p>

            {/* Live Civic Activity Stream simulation */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs backdrop-blur-sm transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Pothole Repair Verified</p>
                    <p className="text-[11px] text-slate-400">Sector 4 • 2 Community Sign-offs</p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                  98.4% AI Match
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs backdrop-blur-sm transition-all hover:border-teal-500/40">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-500/10 text-teal-400">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">Streetlight Dispatched</p>
                    <p className="text-[11px] text-slate-400">Civil Lines • Work Order Issued</p>
                  </div>
                </div>
                <span className="rounded-md bg-teal-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-400">
                  Assigned
                </span>
              </div>
            </div>

            {/* Key Metric Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3 text-center border-t border-slate-800/80 pt-6">
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</p>
                <p className="text-[11px] text-slate-400 font-medium">Public Audit</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-300 font-mono">&lt; 4 hr</p>
                <p className="text-[11px] text-slate-400 font-medium">Avg Dispatch</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">2-Party</p>
                <p className="text-[11px] text-slate-400 font-medium">Sign-Off</p>
              </div>
            </div>
          </div>

          {/* Civic Platform Trust Seal */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Immutable Municipal Ledger</span>
            </div>
            <span className="font-mono text-emerald-400/80">ISO 27001 COMPLIANT</span>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: ULTRA-PREMIUM AUTH FORM
        ========================================================= */}
        <div className="flex flex-col justify-center rounded-3xl border border-slate-800/90 bg-slate-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl lg:col-span-6">
          {/* Header Switcher: Citizen vs Officer */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {mode === "register" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                {mode === "register"
                  ? "Register as a civic participant to report and verify issues."
                  : "Sign in to access your city reporting console."}
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Quick Demo Switcher Tabs */}
          {mode === "login" && (
            <div className="mb-6">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Zap size={13} className="text-emerald-400" />
                <span>Instant Hackathon Demo Logins:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyDemo("citizen")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    roleTab === "citizen"
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <Users size={14} />
                  <span>Citizen Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyDemo("officer")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                    roleTab === "officer"
                      ? "border-teal-400 bg-teal-500/15 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.15)]"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <Building2 size={14} />
                  <span>Officer Demo</span>
                </button>
              </div>

              {/* 1-Click Direct Login Button for Instant Access */}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => instantDemoLogin("citizen")}
                  className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 py-1.5 text-[11px] font-bold text-emerald-300 transition cursor-pointer"
                >
                  ⚡ Auto-Login as Citizen
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => instantDemoLogin("officer")}
                  className="flex-1 rounded-lg border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/60 py-1.5 text-[11px] font-bold text-teal-300 transition cursor-pointer"
                >
                  🛡️ Auto-Login as Officer
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs font-semibold text-red-300 backdrop-blur-md">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Arun Sharma"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@civicconnect.demo"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                {mode === "login" && (
                  <span className="text-xs text-slate-400">
                    Default demo: <code className="text-emerald-400">Demo@123</code>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:opacity-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>{mode === "register" ? "Create Free Citizen Account" : "Enter Civic Console"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Lock size={12} className="text-emerald-400/70" />
            <span>256-Bit Encrypted Session • Open Municipal Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
