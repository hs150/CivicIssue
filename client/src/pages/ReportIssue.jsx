import { useEffect, useState } from "react";
import { Camera, Crosshair, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import MapPicker from "../components/MapPicker.jsx";

const categories = [
  ["road", "Road Damage"], ["garbage", "Garbage / Waste"], ["streetlight", "Broken Streetlight"],
  ["water", "Water Leakage"], ["drainage", "Drainage / Flooding"], ["traffic", "Traffic / Signage"], ["other", "Other"]
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "road", address: "" });
  const [location, setLocation] = useState({ latitude: 28.6139, longitude: 77.2090 });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {}
    );
  }, []);

  function useLocation() {
    navigator.geolocation?.getCurrentPosition(
      pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setMessage("Location permission was not available. Click the map to choose a location.")
    );
  }

  function chooseImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSimilar([]);

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("latitude", location.latitude);
    data.append("longitude", location.longitude);
    data.append("address", form.address);
    if (image) data.append("image", image);

    try {
      const res = await api.post("/issues", data);
      setSimilar(res.data.similarIssues || []);
      setMessage(`Issue ${res.data.issue.issueCode} submitted successfully.`);
      setTimeout(() => navigate(`/issues/${res.data.issue._id}`), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit the issue.");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="max-w-2xl">
        <p className="font-bold text-emerald-700">Citizen reporting</p>
        <h1 className="mt-2 text-4xl font-black">Report an issue</h1>
        <p className="mt-2 text-slate-500">Give authorities enough context to act quickly.</p>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold">What's the issue?
            <input className="field mt-2" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Large pothole near MG Road" required />
          </label>

          <label className="block text-sm font-bold">Category
            <select className="field mt-2" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {categories.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>

          <label className="block text-sm font-bold">Description
            <textarea className="field mt-2 min-h-32 resize-y" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Describe what happened, how severe it is, and any useful landmark." required />
          </label>

          <label className="block text-sm font-bold">Address / landmark
            <input className="field mt-2" value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Optional: street, market, landmark" />
          </label>

          <div>
            <p className="text-sm font-bold">Photo</p>
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-sm font-bold text-slate-500 hover:bg-slate-50">
              <UploadCloud size={20}/> {image ? image.name : "Upload an image (max 5 MB)"}
              <input className="hidden" type="file" accept="image/*" onChange={chooseImage}/>
            </label>
            {preview && <img src={preview} alt="Preview" className="mt-3 h-48 w-full rounded-2xl object-cover" />}
          </div>

          <button disabled={loading} className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-60">
            {loading ? "Submitting…" : "Submit report"}
          </button>

          {message && <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</div>}
          {similar.length > 0 && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><b>Similar issues found:</b> {similar.map(s => s.title).join(", ")}</div>}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-bold">Location</p><p className="text-xs text-slate-500">Click the map or use your current position.</p></div>
            <button type="button" onClick={useLocation} className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"><Crosshair size={16}/> Use GPS</button>
          </div>
          <div className="mt-4"><MapPicker value={location} onChange={setLocation}/></div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <Camera size={14} className="mr-1 inline"/> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        </div>
      </form>
    </div>
  );
}
