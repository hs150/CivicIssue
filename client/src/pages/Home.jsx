import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:items-center md:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Community-powered civic action
            </div>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              Report problems. <span className="text-emerald-700">Track progress.</span> Improve your city.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CivicConnect turns potholes, waste, broken lights and other local problems into transparent, trackable workflows for citizens and authorities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? "/report" : "/login"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800">
                Report an issue <ArrowRight size={18}/>
              </Link>
              <Link to="/issues" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 hover:bg-slate-50">Explore issues</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <p className="font-bold">Issue #CC-1001</p>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">IN PROGRESS</span>
              </div>
              <div className="mt-8 h-48 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-800 to-slate-950 p-5">
                <div className="flex h-full items-end justify-between">
                  {["Reported", "Assigned", "In progress", "Resolved"].map((x, i) => (
                    <div key={x} className="flex flex-col items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${i < 3 ? "bg-emerald-400" : "bg-slate-600"}`} />
                      <span className="text-center text-[10px] text-slate-300">{x}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-xl font-black">Large pothole near MG Road</p>
              <div className="mt-4 flex gap-4 text-sm text-slate-400">
                <span>📍 MG Road</span><span>👍 18 supporters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [MapPinned, "Location-first", "Pin the exact problem location and give officers usable geographic context."],
            [ShieldCheck, "Transparent workflow", "Track every issue from NEW through IN PROGRESS to RESOLVED."],
            [Users, "Community support", "Comments and upvotes help authorities understand which problems matter most."]
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon /></div>
              <h3 className="font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-[2rem] bg-emerald-900 p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-black">One report. One visible resolution path.</h2>
              <p className="mt-3 max-w-2xl text-emerald-100">Built around the core civic workflow so a hackathon demo can show real value without unnecessary complexity.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold"><CheckCircle2/> Citizen → Authority → Resolution</div>
          </div>
        </div>
      </section>
    </>
  );
}
