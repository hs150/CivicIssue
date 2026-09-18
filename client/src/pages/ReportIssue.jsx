import { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Crosshair,
  UploadCloud,
  Sparkles,
  X,
  RotateCcw,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ExternalLink,
  MapPinOff
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
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

const allowedCategories = [
  "road",
  "garbage",
  "streetlight",
  "water",
  "drainage",
  "traffic",
  "other"
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

  // =========================================================
  // GEO-DEDUPLICATION STATE
  // =========================================================

  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [dedupDismissed, setDedupDismissed] = useState(false);
  const [checkingNearby, setCheckingNearby] = useState(false);
  const nearbyTimerRef = useRef(null);

  // =========================================================
  // COMPLETE AI ANALYSIS STATE
  // =========================================================

  const [aiAnalysis, setAiAnalysis] = useState(null);

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
      if (nearbyTimerRef.current) clearTimeout(nearbyTimerRef.current);
    };
  }, []);

  // =========================================================
  // GEO-DEDUPLICATION: CHECK NEARBY ISSUES
  // =========================================================

  useEffect(() => {
    if (nearbyTimerRef.current) clearTimeout(nearbyTimerRef.current);

    nearbyTimerRef.current = setTimeout(async () => {
      if (!location.latitude || !location.longitude) return;

      setCheckingNearby(true);
      try {
        const params = new URLSearchParams({
          lat: location.latitude,
          lng: location.longitude,
          radius: 500
        });
        if (form.category && form.category !== "other") {
          params.set("category", form.category);
        }
        const res = await api.get(`/issues/nearby?${params}`);
        setNearbyIssues(res.data.nearby || []);
        setDedupDismissed(false);
      } catch (err) {
        console.error("Nearby check failed:", err);
        setNearbyIssues([]);
      } finally {
        setCheckingNearby(false);
      }
    }, 800); // 800ms debounce

  }, [location.latitude, location.longitude, form.category]);

  // =========================================================
  // LOCATION
  // =========================================================

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

  // =========================================================
  // CAMERA
  // =========================================================

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

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraOpen(false);
  }

  // =========================================================
  // CAPTURE PHOTO
  // =========================================================

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

        stopCamera();

        analyzeImage(file);
      },
      "image/jpeg",
      0.9
    );
  }

  // =========================================================
  // NORMALIZE GEMINI CATEGORY
  // =========================================================

  function normalizeCategory(category) {
    const normalized = String(category || "")
      .trim()
      .toLowerCase();

    if (allowedCategories.includes(normalized)) {
      return normalized;
    }

    return "other";
  }

  // =========================================================
  // GENERATE TITLE
  // =========================================================

  function generateTitle(issue, category) {
    if (issue?.title) {
      return issue.title;
    }

    if (issue?.subcategory) {
      return issue.subcategory
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
    }

    const categoryLabel =
      categories.find(
        ([value]) => value === category
      )?.[1];

    return categoryLabel || "Civic Issue Detected";
  }

  // =========================================================
  // ANALYZE IMAGE WITH GEMINI
  // =========================================================

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

    setAiAnalysis(null);

    const data = new FormData();

    data.append("image", file);

    try {
      const res = await api.post(
        "/issues/analyze-image",
        data
      );

      const analysis =
        res.data?.analysis || {};

      console.log(
        "======================================"
      );

      console.log(
        "GEMINI COMPLETE ANALYSIS:",
        analysis
      );

      console.log(
        "======================================"
      );

      // =====================================================
      // EXTRACT GEMINI RESPONSE SECTIONS
      // =====================================================

      const issue =
        analysis.issue || {};

      const routing =
        analysis.routing || {};

      const visualEvidence =
        analysis.visualEvidence || {};

      const safety =
        analysis.safety || {};

      const locationClues =
        analysis.locationClues || {};

      const environment =
        analysis.environment || {};

      const evidence =
        analysis.evidence || {};

      const ai =
        analysis.ai || {};

      // =====================================================
      // CATEGORY
      // =====================================================

      const finalCategory =
        normalizeCategory(
          issue.category
        );

      // =====================================================
      // TITLE
      // =====================================================

      const finalTitle =
        generateTitle(
          issue,
          finalCategory
        );

      // =====================================================
      // DESCRIPTION
      // =====================================================

      let finalDescription =
        issue.description ||
        "";

      if (
        routing.recommendedAction &&
        !finalDescription.includes(
          routing.recommendedAction
        )
      ) {
        finalDescription +=
          ` Recommended action: ${routing.recommendedAction}`;
      }

      if (!finalDescription) {
        finalDescription =
          "AI detected a potential civic issue from the uploaded image.";
      }

      // =====================================================
      // LOCATION CLUES
      // =====================================================

      let detectedAddress = "";

      if (
        Array.isArray(
          locationClues.visibleText
        )
      ) {
        const addressCandidate =
          locationClues.visibleText.find(
            text =>
              text &&
              !/^lat\b/i.test(text) &&
              !/^long\b/i.test(text) &&
              !/^gps/i.test(text) &&
              !/^\d{2}\/\d{2}\/\d{4}/.test(
                text
              )
          );

        detectedAddress =
          addressCandidate || "";
      }

      // =====================================================
      // STORE COMPLETE AI ANALYSIS
      // =====================================================

      setAiAnalysis({
        issue,
        routing,
        visualEvidence,
        safety,
        locationClues,
        environment,
        evidence,
        ai
      });

      // =====================================================
      // POPULATE FORM
      // =====================================================

      setForm(prev => ({
        ...prev,

        title:
          finalTitle,

        category:
          finalCategory,

        department:
          routing.department ||
          "",

        description:
          finalDescription,

        severity:
          issue.severity ||
          "",

        address:
          prev.address ||
          detectedAddress ||
          ""
      }));

      // =====================================================
      // IF GEMINI FOUND LOCATION COORDINATES
      // =====================================================

      const visibleText =
        Array.isArray(
          locationClues.visibleText
        )
          ? locationClues.visibleText
          : [];

      const coordinateText =
        visibleText.find(
          text =>
            typeof text === "string" &&
            /Lat\s*-?\d+\.\d+.*Long\s*-?\d+\.\d+/i.test(
              text
            )
        );

      if (coordinateText) {
        const match =
          coordinateText.match(
            /Lat\s*(-?\d+(?:\.\d+)?)\D+Long\s*(-?\d+(?:\.\d+)?)/i
          );

        if (match) {
          const latitude =
            Number(match[1]);

          const longitude =
            Number(match[2]);

          if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
          ) {
            setLocation({
              latitude,
              longitude
            });
          }
        }
      }

      // =====================================================
      // AI STATUS MESSAGE
      // =====================================================

      if (
        evidence.relevant === false
      ) {
        setMessage(
          "⚠️ AI could not confirm a clear civic issue. Please review the details before submitting."
        );
      } else {
        setMessage(
          "✨ AI analyzed the image and filled the complaint details automatically."
        );
      }
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

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  async function chooseImage(e) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    await analyzeImage(file);
  }

  // =========================================================
  // SUBMIT ISSUE
  // =========================================================

  async function submit(e) {
    e.preventDefault();

    if (analyzing) {
      setMessage(
        "Please wait for AI image analysis to finish."
      );

      return;
    }

    setLoading(true);

    setMessage("");

    setSimilar([]);

    const data =
      new FormData();

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
      const res =
        await api.post(
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
      console.error(
        "Issue submission failed:",
        err
      );

      setMessage(
        err.response?.data?.message ||
        "Could not submit the issue."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FORM UPDATE
  // =========================================================

  function updateForm(
    field,
    value
  ) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // =========================================================
  // SEVERITY HELPER
  // =========================================================

  function severityClass(
    severity
  ) {
    const value =
      String(
        severity || ""
      ).toLowerCase();

    if (value === "high") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value === "medium") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (value === "low") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

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

      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <form
        onSubmit={submit}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]"
      >

        {/* ===================================================
            LEFT PANEL
        =================================================== */}

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
              className={`field mt-2 ${severityClass(
                form.severity
              )}`}
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

          {/* =================================================
              PHOTO
          ================================================= */}

          <div>

            <p className="text-sm font-bold">
              Photo
            </p>

            {!cameraOpen && (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">

                {/* CAMERA */}

                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-4 font-bold text-white hover:bg-emerald-800"
                >
                  <Camera size={20} />

                  Take Photo
                </button>

                {/* UPLOAD */}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-4 font-bold text-slate-600 hover:bg-slate-50">

                  <UploadCloud size={20} />

                  Upload Photo

                  <input
                    className="hidden"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={chooseImage}
                  />

                </label>

              </div>
            )}

            {/* =================================================
                CAMERA
            ================================================= */}

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

            {/* =================================================
                IMAGE PREVIEW
            ================================================= */}

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

          {/* =================================================
              AI ANALYZING
          ================================================= */}

          {analyzing && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">

              <Sparkles
                size={18}
                className="mr-2 inline animate-pulse"
              />

              Gemini is analyzing the image...

              <p className="mt-2 text-xs font-normal text-blue-700">
                Detecting issue type, severity, visual evidence,
                hazards, location clues and responsible department.
              </p>

            </div>
          )}

          {/* =================================================
              AI ANALYSIS RESULT
          ================================================= */}

          {aiAnalysis && !analyzing && (
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

              <div className="flex items-center gap-2">

                <Sparkles
                  size={18}
                  className="text-emerald-700"
                />

                <p className="font-black text-emerald-900">
                  AI Analysis Complete
                </p>

              </div>

              {/* CONFIDENCE */}

              {aiAnalysis.evidence?.confidence !==
                undefined && (
                <div className="text-xs text-emerald-800">
                  AI confidence:{" "}
                  <b>
                    {Math.round(
                      Number(
                        aiAnalysis.evidence.confidence
                      ) * 100
                    )}
                    %
                  </b>
                </div>
              )}

              {/* SUBCATEGORY */}

              {aiAnalysis.issue?.subcategory && (
                <div className="rounded-xl bg-white p-3">

                  <p className="text-xs font-bold uppercase text-slate-400">
                    Detected issue
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {aiAnalysis.issue.subcategory}
                  </p>

                </div>
              )}

              {/* PRIORITY */}

              {aiAnalysis.issue?.priority && (
                <div className="flex items-center justify-between rounded-xl bg-white p-3">

                  <span className="text-sm font-bold text-slate-600">
                    Priority
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase">
                    {aiAnalysis.issue.priority}
                  </span>

                </div>
              )}

              {/* HAZARD */}

              <div className="flex items-center justify-between rounded-xl bg-white p-3">

                <div className="flex items-center gap-2">

                  {aiAnalysis.safety?.hazardDetected ? (
                    <AlertTriangle
                      size={18}
                      className="text-red-600"
                    />
                  ) : (
                    <ShieldAlert
                      size={18}
                      className="text-emerald-600"
                    />
                  )}

                  <span className="text-sm font-bold text-slate-700">
                    Safety hazard
                  </span>

                </div>

                <span className="text-xs font-black uppercase">
                  {aiAnalysis.safety?.hazardDetected
                    ? "Detected"
                    : "None detected"}
                </span>

              </div>

              {/* IMAGE RELEVANCE */}

              {aiAnalysis.evidence?.relevant !==
                undefined && (
                <div className="flex items-center gap-2 text-xs font-semibold">

                  {aiAnalysis.evidence.relevant ? (
                    <>
                      <CheckCircle2
                        size={15}
                        className="text-emerald-600"
                      />

                      Image is relevant to civic reporting.
                    </>
                  ) : (
                    <>
                      <AlertTriangle
                        size={15}
                        className="text-amber-600"
                      />

                      Image may not show a clear civic issue.
                    </>
                  )}

                </div>
              )}

              {/* HUMAN REVIEW */}

              {aiAnalysis.ai?.requiresHumanReview && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">

                  ⚠️ AI recommends human review before this
                  issue is processed.

                </div>
              )}

            </div>
          )}

          {/* =================================================
              GEO-DEDUPLICATION PROMPT
          ================================================= */}

          {nearbyIssues.length > 0 && !dedupDismissed && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">

              <div className="flex items-center gap-2">
                <MapPinOff size={20} className="text-amber-700" />
                <p className="font-black text-amber-900">
                  Similar issues found nearby!
                </p>
              </div>

              <p className="mt-2 text-sm text-amber-800">
                We found {nearbyIssues.length} existing issue{nearbyIssues.length > 1 ? "s" : ""} within 500m of your location.
                Consider supporting an existing report instead of creating a duplicate.
              </p>

              <div className="mt-4 space-y-2">
                {nearbyIssues.map(nearby => (
                  <div key={nearby.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/issues/${nearby.id}`}
                        className="font-bold text-sm text-slate-800 hover:text-emerald-700 truncate block"
                      >
                        {nearby.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {nearby.distanceMeters}m away • {nearby.phase?.replace(/_/g, " ")} • {nearby.upvotes || 0} supporters
                      </p>
                    </div>
                    <Link
                      to={`/issues/${nearby.id}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <ThumbsUp size={13} />
                      Support
                    </Link>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDedupDismissed(true)}
                className="mt-4 w-full rounded-xl border border-amber-400 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                This is a different issue — continue submitting
              </button>
            </div>
          )}

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            disabled={
              loading ||
              analyzing ||
              (nearbyIssues.length > 0 && !dedupDismissed)
            }
            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : analyzing
                ? "AI analyzing..."
                : nearbyIssues.length > 0 && !dedupDismissed
                  ? "Review nearby issues first"
                  : "Submit report"}
          </button>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              {message}
            </div>
          )}

          {/* =================================================
              SIMILAR ISSUES
          ================================================= */}

          {similar.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">

              <b>
                Similar issues found:
              </b>{" "}

              {similar
                .map(
                  s => s.title
                )
                .join(", ")}

            </div>
          )}

        </div>

        {/* ===================================================
            LOCATION PANEL
        =================================================== */}

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

          {/* MAP */}

          <div className="mt-4">

            <MapPicker
              value={location}
              onChange={setLocation}
            />

          </div>

          {/* COORDINATES */}

          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">

            <MapPin
              size={14}
              className="mr-1 inline"
            />

            {location.latitude.toFixed(6)},{" "}
            {location.longitude.toFixed(6)}

          </div>

          {/* AI LOCATION CLUES */}

          {aiAnalysis?.locationClues &&
            Array.isArray(
              aiAnalysis.locationClues.visibleText
            ) &&
            aiAnalysis.locationClues.visibleText.length >
              0 && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">

                <p className="text-xs font-black uppercase text-blue-700">
                  AI detected location clues
                </p>

                <div className="mt-2 space-y-1">

                  {aiAnalysis.locationClues.visibleText.map(
                    (text, index) => (
                      <p
                        key={index}
                        className="text-xs text-blue-900"
                      >
                        • {text}
                      </p>
                    )
                  )}

                </div>

              </div>
            )}

          {/* LANDMARKS */}

          {aiAnalysis?.locationClues?.landmarks &&
            aiAnalysis.locationClues.landmarks.length >
              0 && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">

                <p className="text-xs font-black uppercase text-slate-500">
                  Detected landmarks
                </p>

                <div className="mt-2 space-y-1">

                  {aiAnalysis.locationClues.landmarks.map(
                    (landmark, index) => (
                      <p
                        key={index}
                        className="text-xs text-slate-700"
                      >
                        • {landmark}
                      </p>
                    )
                  )}

                </div>

              </div>
            )}

        </div>

      </form>
    </div>
  );
}