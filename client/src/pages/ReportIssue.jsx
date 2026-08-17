import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Crosshair,
  UploadCloud,
  Sparkles,
  X,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import MapPicker from "../components/MapPicker.jsx";

const categories = [
  ["road", "Road Damage"],
  ["garbage", "Garbage / Waste"],
  ["streetlight", "Broken Streetlight"],
  ["water", "Water Leakage"],
  ["drainage", "Drainage / Flooding"],
  ["traffic", "Traffic / Signage"],
  ["other", "Other"]
];

export default function ReportIssue() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "road",
    department: "",
    severity: "",
    address: ""
  });

  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [similar, setSimilar] = useState([]);

  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
      () => {}
    );

    return () => {
      stopCamera();
    };
  }, []);

  function useLocation() {
    navigator.geolocation?.getCurrentPosition(
      pos =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
      () =>
        setMessage(
          "Location permission was not available. Click the map to choose a location."
        )
    );
  }

  // =========================
  // OPEN CAMERA
  // =========================

  async function openCamera() {
    setMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });

      streamRef.current = stream;

      setCameraOpen(true);

      // Wait for video element to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

    } catch (err) {
      console.error("Camera error:", err);

      setMessage(
        "Camera permission denied or camera is not available. Please allow camera access."
      );
    }
  }

  // =========================
  // STOP CAMERA
  // =========================

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraOpen(false);
  }

  // =========================
  // CAPTURE PHOTO
  // =========================

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      blob => {
        if (!blob) return;

        const file = new File(
          [blob],
          `civicconnect-${Date.now()}.jpg`,
          {
            type: "image/jpeg"
          }
        );

        setImage(file);
        setPreview(URL.createObjectURL(file));

        stopCamera();

        // Automatically send captured image to AI
        analyzeImage(file);
      },
      "image/jpeg",
      0.9
    );
  }

  // =========================
  // ANALYZE IMAGE WITH AI
  // =========================

  async function analyzeImage(file) {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");

    setAnalyzing(true);

    const data = new FormData();

    data.append("image", file);

    try {
      const res = await api.post(
        "/issues/analyze-image",
        data
      );

      const analysis = res.data.analysis;

      console.log(
        "AI Image Analysis:",
        analysis
      );

      setForm(prev => ({
        ...prev,
        title: analysis.title || "",
        category: analysis.category || "other",
        department: analysis.department || "",
        description: analysis.description || "",
        severity: analysis.severity || ""
      }));

      setMessage(
        "✨ AI analyzed the image and filled the complaint details automatically."
      );

    } catch (err) {
      console.error(
        "Image analysis failed:",
        err
      );

      setMessage(
        err.response?.data?.message ||
        "AI could not analyze this image. You can fill the details manually."
      );

    } finally {
      setAnalyzing(false);
    }
  }

  // =========================
  // UPLOAD IMAGE
  // =========================

  async function chooseImage(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    await analyzeImage(file);
  }

  // =========================
  // SUBMIT ISSUE
  // =========================

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSimilar([]);

    const data = new FormData();

    data.append(
      "title",
      form.title
    );

    data.append(
      "description",
      form.description
    );

    data.append(
      "category",
      form.category
    );

    data.append(
      "latitude",
      location.latitude
    );

    data.append(
      "longitude",
      location.longitude
    );

    data.append(
      "address",
      form.address
    );

    if (image) {
      data.append(
        "image",
        image
      );
    }

    try {
      const res = await api.post(
        "/issues",
        data
      );

      setSimilar(
        res.data.similarIssues || []
      );

      setMessage(
        `Issue ${res.data.issue.issueCode} submitted successfully.`
      );

      setTimeout(
        () =>
          navigate(
            `/issues/${res.data.issue._id}`
          ),
        1000
      );

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Could not submit the issue."
      );

    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">

      <div className="max-w-2xl">

        <p className="font-bold text-emerald-700">
          AI-powered citizen reporting
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Report an issue
        </h1>

        <p className="mt-2 text-slate-500">
          Take a live photo or upload an image and let AI
          automatically identify the civic issue.
        </p>

      </div>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]"
      >

        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* TITLE */}

          <label className="block text-sm font-bold">
            What's the issue?

            <input
              className="field mt-2"
              value={form.title}
              onChange={e =>
                updateForm(
                  "title",
                  e.target.value
                )
              }
              placeholder="Upload a photo and AI will detect the issue"
              required
            />
          </label>

          {/* CATEGORY */}

          <label className="block text-sm font-bold">
            Category

            <select
              className="field mt-2"
              value={form.category}
              onChange={e =>
                updateForm(
                  "category",
                  e.target.value
                )
              }
            >
              {categories.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          {/* DEPARTMENT */}

          <label className="block text-sm font-bold">
            Department

            <input
              className="field mt-2"
              value={form.department}
              onChange={e =>
                updateForm(
                  "department",
                  e.target.value
                )
              }
              placeholder="AI will detect responsible department"
              readOnly
            />
          </label>

          {/* SEVERITY */}

          <label className="block text-sm font-bold">
            Severity

            <input
              className="field mt-2"
              value={form.severity}
              onChange={e =>
                updateForm(
                  "severity",
                  e.target.value
                )
              }
              placeholder="AI will detect severity"
              readOnly
            />
          </label>

          {/* DESCRIPTION */}

          <label className="block text-sm font-bold">
            Description

            <textarea
              className="field mt-2 min-h-32 resize-y"
              value={form.description}
              onChange={e =>
                updateForm(
                  "description",
                  e.target.value
                )
              }
              placeholder="AI will generate the description from the image"
              required
            />
          </label>

          {/* ADDRESS */}

          <label className="block text-sm font-bold">
            Address / landmark

            <input
              className="field mt-2"
              value={form.address}
              onChange={e =>
                updateForm(
                  "address",
                  e.target.value
                )
              }
              placeholder="Optional: street, market, landmark"
            />
          </label>

          {/* PHOTO */}

          <div>

            <p className="text-sm font-bold">
              Photo
            </p>

            {/* CAMERA BUTTON */}

            {!cameraOpen && (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-4 font-bold text-white hover:bg-emerald-800"
                >
                  <Camera size={20} />
                  Take Photo
                </button>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-4 font-bold text-slate-600 hover:bg-slate-50">

                  <UploadCloud size={20} />

                  Upload Photo

                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={chooseImage}
                  />

                </label>

              </div>
            )}

            {/* LIVE CAMERA */}

            {cameraOpen && (
              <div className="mt-3 overflow-hidden rounded-2xl bg-black">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-80 w-full object-cover"
                />

                <div className="flex gap-3 p-3">

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white"
                  >
                    <Camera size={20} />
                    Capture
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-700"
                  >
                    <X size={20} />
                    Close
                  </button>

                </div>

              </div>
            )}

            {/* HIDDEN CANVAS */}

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* IMAGE PREVIEW */}

            {preview && !cameraOpen && (
              <div className="relative mt-3">

                <img
                  src={preview}
                  alt="Captured civic issue"
                  className="h-56 w-full rounded-2xl object-cover"
                />

                {!analyzing && (
                  <button
                    type="button"
                    onClick={openCamera}
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-black/70 px-3 py-2 text-sm font-bold text-white"
                  >
                    <RotateCcw size={16} />
                    Retake
                  </button>
                )}

              </div>
            )}

          </div>

          {/* AI STATUS */}

          {analyzing && (
            <div className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">

              <Sparkles
                size={18}
                className="mr-2 inline animate-pulse"
              />

              Gemini AI is analyzing your image...

            </div>
          )}

          {/* SUBMIT */}

          <button
            disabled={
              loading ||
              analyzing
            }
            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit report"}
          </button>

          {/* MESSAGE */}

          {message && (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              {message}
            </div>
          )}

          {/* SIMILAR */}

          {similar.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">

              <b>
                Similar issues found:
              </b>{" "}

              {similar
                .map(s => s.title)
                .join(", ")}

            </div>
          )}

        </div>

        {/* LOCATION */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <div>

              <p className="text-sm font-bold">
                Location
              </p>

              <p className="text-xs text-slate-500">
                Click the map or use your current position.
              </p>

            </div>

            <button
              type="button"
              onClick={useLocation}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
            >
              <Crosshair size={16} />
              Use GPS
            </button>

          </div>

          <div className="mt-4">

            <MapPicker
              value={location}
              onChange={setLocation}
            />

          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">

            <Camera
              size={14}
              className="mr-1 inline"
            />

            {location.latitude.toFixed(6)},{" "}
            {location.longitude.toFixed(6)}

          </div>

        </div>

      </form>
    </div>
  );
}