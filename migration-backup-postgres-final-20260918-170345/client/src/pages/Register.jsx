import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="font-bold text-emerald-700">CivicConnect</p>
        <h1 className="mt-2 text-4xl font-black">Create your account</h1>
        <p className="mt-2 text-slate-500">Citizen accounts can report, support and track civic issues.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <label className="mt-6 block text-sm font-bold">Name<input className="field mt-2" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required /></label>
        <label className="mt-4 block text-sm font-bold">Email<input className="field mt-2" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required /></label>
        <label className="mt-4 block text-sm font-bold">Password<input className="field mt-2" type="password" minLength={6} value={form.password} onChange={e => setForm({...form, password:e.target.value})} required /></label>
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white">{loading ? "Creating…" : "Create account"}</button>
        <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-emerald-700" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
