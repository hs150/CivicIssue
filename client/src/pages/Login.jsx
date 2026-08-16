import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const target = location.state?.from || (user.role === "citizen" ? "/" : "/dashboard");
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return <AuthForm title="Welcome back" subtitle="Sign in to report issues and track progress." form={form} setForm={setForm} error={error} loading={loading} submit={submit} mode="login" />;
}

function AuthForm({ title, subtitle, form, setForm, error, loading, submit, mode }) {
  const isRegister = mode === "register";
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLocalError("");
    try {
      await register(name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setLocalError(err.response?.data?.message || "Unable to register.");
    }
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center px-5 py-12 md:grid-cols-2 md:gap-12">
      <div className="hidden md:block">
        <p className="font-bold text-emerald-700">CivicConnect</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Make local problems visible.</h1>
        <p className="mt-5 leading-7 text-slate-500">Report a problem, follow the status, and give your community a transparent resolution trail.</p>
      </div>
      <form onSubmit={isRegister ? handleRegister : submit} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

        {(error || localError) && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error || localError}</div>}

        {isRegister && (
          <label className="mt-6 block text-sm font-bold">
            Name
            <input value={name} onChange={e => setName(e.target.value)} className="field mt-2" placeholder="Your name" required />
          </label>
        )}

        <label className="mt-6 block text-sm font-bold">
          Email
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="field mt-2" placeholder="you@example.com" required />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Password
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="field mt-2" placeholder="••••••••" minLength={6} required />
        </label>

        <button disabled={loading} className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-60">
          {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>

        {!isRegister ? (
          <>
            <p className="mt-5 text-center text-sm text-slate-500">No account? <Link className="font-bold text-emerald-700" to="/register">Create one</Link></p>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
              Demo: <b>citizen@civicconnect.demo</b> / <b>Demo@123</b><br/>
              Officer: <b>officer@civicconnect.demo</b> / <b>Demo@123</b>
            </div>
          </>
        ) : (
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-emerald-700" to="/login">Sign in</Link></p>
        )}
      </form>
    </div>
  );
}
