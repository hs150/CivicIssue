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
import { useToast } from "../context/ToastContext.jsx";
import MapPicker from "../components/MapPicker.jsx";
import { VoiceAssistant, isSpeechSupported } from "../services/speechService.js";
import { Mic, MicOff, Languages, Volume2 } from "lucide-react";

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
  const toast = useToast();

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

  // =========================================================
  // VOICE-TO-REPORT (ENGLISH & HINDI)
  // =========================================================
  const [voiceLang, setVoiceLang] = useState("en-IN"); // "en-IN" | "hi-IN"
  const [isListening, setIsListening] = useState(false);
  const voiceAssistantRef = useRef(null);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant({
      lang: voiceLang,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: (err) => {
        setIsListening(false);
        if (err === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access.");
        }
      },
      onResult: ({ final }) => {
        if (final) {
          setForm((prev) => {
            const newDesc = prev.description ? `${prev.description} ${final}` : final;
            const newTitle = prev.title || final.slice(0, 50);
            return { ...prev, description: newDesc, title: newTitle };
          });
          toast.info(`Voice captured (${voiceLang === "hi-IN" ? "हिन्दी" : "English"})`);
        }
      }
    });

    return () => {
      if (voiceAssistantRef.current) {
        voiceAssistantRef.current.stop();
      }
    };
  }, [voiceLang]);

  function toggleVoice() {
    if (!isSpeechSupported()) {
      toast.warning("Speech recognition is not supported in this browser. Please type manually.");
      return;
    }

    if (isListening) {
      voiceAssistantRef.current?.stop();
    } else {
      voiceAssistantRef.current?.start();
      toast.info(`Listening in ${voiceLang === "hi-IN" ? "हिन्दी (Hindi)" : "English"}... Speak now!`);
    }
  }

  function handleVoiceLangChange(lang) {
    setVoiceLang(lang);
    voiceAssistantRef.current?.setLanguage(lang);
    toast.info(`Switched voice language to ${lang === "hi-IN" ? "हिन्दी" : "English"}`);
  }

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
      toast.success(`Issue ${res.data.issue.issueCode} submitted successfully! 🚀`);

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

      const errorMsg =
        err.response?.data?.message ||
        "Could not submit the issue.";
      setMessage(errorMsg);
      toast.error(errorMsg);
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
      return "bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700";
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

        <p className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          AI-powered citizen reporting
        </p>

        <h1 className="mt-2 text-4xl font-black text-neutral-900 dark:text-white">
          Report an issue
        </h1>

        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Take a live photo or upload an image and let AI
          automatically identify the civic issue.
        </p>

      </div>

      {/* =====================================================
          STEP PROGRESS INDICATOR
      ===================================================== */}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`rounded-2xl p-3.5 border transition-all flex items-center gap-3 ${
          preview && !analyzing
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
            : analyzing
            ? "border-neutral-400 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white animate-pulse shadow-xs"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-500 dark:text-neutral-400"
        }`}>
          <span className={`h-6 w-6 rounded-full grid place-items-center text-xs font-black ${
            preview && !analyzing ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}>1</span>
          <div className="flex flex-col">
            <span className="text-xs font-black">Evidence & AI Scan</span>
            <span className="text-[10px] text-neutral-400">
              {preview ? (analyzing ? "Scanning..." : "Analyzed") : "Photo required"}
            </span>
          </div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all flex items-center gap-3 ${
          location.latitude && location.longitude && !checkingNearby
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
            : checkingNearby
            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 animate-pulse shadow-xs"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-500 dark:text-neutral-400"
        }`}>
          <span className={`h-6 w-6 rounded-full grid place-items-center text-xs font-black ${
            location.latitude && location.longitude ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}>2</span>
          <div className="flex flex-col">
            <span className="text-xs font-black">Location & Dedup</span>
            <span className="text-[10px] text-neutral-400">
              {checkingNearby ? "Checking radius..." : `${nearbyIssues.length} nearby detected`}
            </span>
          </div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all flex items-center gap-3 ${
          form.title && form.description
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-500 dark:text-neutral-400"
        }`}>
          <span className={`h-6 w-6 rounded-full grid place-items-center text-xs font-black ${
            form.title && form.description ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}>3</span>
          <div className="flex flex-col">
            <span className="text-xs font-black">Review & Submit</span>
            <span className="text-[10px] text-neutral-400">Ready to transmit</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN FORM
      ===================================================== */}

      <form
        onSubmit={submit}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_.9fr]"
      >

        {/* ===================================================
            LEFT PANEL
        =================================================== */}

        <div className="space-y-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-sm">

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

          {/* =================================================
              VOICE-TO-REPORT ASSISTANT
          ================================================= */}

          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                <Volume2 size={15} className="text-black dark:text-white" />
                <span>Voice-to-Report Assistant</span>
              </div>

              {/* Language Toggle */}
              <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-0.5 text-[11px] font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleVoiceLangChange("en-IN")}
                  className={`px-2 py-0.5 rounded-md transition ${
                    voiceLang === "en-IN"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  EN (English)
                </button>
                <button
                  type="button"
                  onClick={() => handleVoiceLangChange("hi-IN")}
                  className={`px-2 py-0.5 rounded-md transition ${
                    voiceLang === "hi-IN"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>

            {/* Mic trigger and status */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleVoice}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all duration-300 shadow-sm active:scale-95 ${
                  isListening
                    ? "bg-rose-600 text-white shadow-rose-600/30 animate-pulse ring-4 ring-rose-600/20"
                    : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={15} />
                    <span>Listening... Tap to finish</span>
                  </>
                ) : (
                  <>
                    <Mic size={15} />
                    <span>Speak in {voiceLang === "hi-IN" ? "हिन्दी" : "English"}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              💡 Speak your problem aloud. The transcript will automatically populate your complaint description.
            </p>
          </div>

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
                  className="flex items-center justify-center gap-2 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 p-4 font-bold transition cursor-pointer"
                >
                  <Camera size={20} />

                  Take Photo
                </button>

                {/* UPLOAD */}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-4 font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition">

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
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white text-black dark:bg-black dark:text-white px-4 py-3 font-bold cursor-pointer"
                  >
                    <Camera size={20} />

                    Capture
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 px-4 py-3 font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
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
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-neutral-300 dark:border-neutral-700">

                <img
                  src={preview}
                  alt="Captured civic issue"
                  className={`h-60 w-full object-cover transition duration-300 ${
                    analyzing ? "brightness-75 contrast-125 saturate-150" : ""
                  }`}
                />

                {/* HUD Reticle & Laser Sweep Overlay (Monochrome) */}
                {analyzing && (
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pointer-events-none border-2 border-white/80 rounded-2xl bg-black/40 backdrop-blur-xs">
                    {/* Top Reticles */}
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-4 border-t-2 border-l-2 border-white" />
                      <div className="flex items-center gap-1.5 rounded-full bg-black/90 px-3 py-1 text-[11px] font-black text-white border border-white/40 shadow-xl backdrop-blur-md">
                        <Sparkles size={12} className="animate-spin text-white" />
                        <span>AI RETINA SCANNING</span>
                      </div>
                      <div className="h-4 w-4 border-t-2 border-r-2 border-white" />
                    </div>

                    {/* Scanning Laser Beam */}
                    <div className="relative w-full">
                      <div
                        className="h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff] animate-pulse"
                      />
                    </div>

                    {/* Bottom Reticles */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-300 font-mono">
                      <div className="h-4 w-4 border-b-2 border-l-2 border-white" />
                      <span>ANALYZING TEXTURE & HAZARDS</span>
                      <div className="h-4 w-4 border-b-2 border-r-2 border-white" />
                    </div>
                  </div>
                )}

                {!analyzing && (
                  <button
                    type="button"
                    onClick={openCamera}
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-black/75 backdrop-blur-md px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-black transition"
                  >
                    <RotateCcw size={14} />

                    Retake Photo
                  </button>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              AI ANALYZING
          ================================================= */}

          {analyzing && (
            <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-4 text-sm font-semibold text-neutral-900 dark:text-white">

              <Sparkles
                size={18}
                className="mr-2 inline animate-pulse text-black dark:text-white"
              />

              Gemini is analyzing the image...

              <p className="mt-2 text-xs font-normal text-neutral-600 dark:text-neutral-400">
                Detecting issue type, severity, visual evidence,
                hazards, location clues and responsible department.
              </p>

            </div>
          )}

          {/* =================================================
              AI ANALYSIS RESULT
          ================================================= */}

          {aiAnalysis && !analyzing && (
            <div className="space-y-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-4">

              <div className="flex items-center gap-2">

                <Sparkles
                  size={18}
                  className="text-neutral-900 dark:text-white"
                />

                <p className="font-black text-neutral-900 dark:text-white">
                  AI Analysis Complete
                </p>

              </div>

              {/* CONFIDENCE */}

              {aiAnalysis.evidence?.confidence !==
                undefined && (
                <div className="text-xs text-neutral-800 dark:text-neutral-200">
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
                <div className="rounded-xl bg-white dark:bg-black p-3 border border-neutral-200 dark:border-neutral-800">

                  <p className="text-xs font-bold uppercase text-neutral-400">
                    Detected issue
                  </p>

                  <p className="mt-1 font-bold text-neutral-900 dark:text-white">
                    {aiAnalysis.issue.subcategory}
                  </p>

                </div>
              )}

              {/* PRIORITY */}

              {aiAnalysis.issue?.priority && (
                <div className="flex items-center justify-between rounded-xl bg-white dark:bg-black p-3 border border-neutral-200 dark:border-neutral-800">

                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Priority
                  </span>

                  <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-black uppercase text-neutral-900 dark:text-white">
                    {aiAnalysis.issue.priority}
                  </span>

                </div>
              )}

              {/* HAZARD */}

              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-black p-3 border border-neutral-200 dark:border-neutral-800">

                <div className="flex items-center gap-2">

                  {aiAnalysis.safety?.hazardDetected ? (
                    <AlertTriangle
                      size={18}
                      className="text-red-600"
                    />
                  ) : (
                    <ShieldAlert
                      size={18}
                      className="text-neutral-900 dark:text-white"
                    />
                  )}

                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Safety hazard
                  </span>

                </div>

                <span className="text-xs font-black uppercase text-neutral-900 dark:text-white">
                  {aiAnalysis.safety?.hazardDetected
                    ? "Detected"
                    : "None detected"}
                </span>

              </div>

              {/* IMAGE RELEVANCE */}

              {aiAnalysis.evidence?.relevant !==
                undefined && (
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white">

                  {aiAnalysis.evidence.relevant ? (
                    <>
                      <CheckCircle2
                        size={15}
                        className="text-black dark:text-white"
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
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs font-semibold text-amber-800 dark:text-amber-300">

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
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-5">

              <div className="flex items-center gap-2">
                <MapPinOff size={20} className="text-amber-700 dark:text-amber-400" />
                <p className="font-black text-amber-900 dark:text-amber-200">
                  Similar issues found nearby!
                </p>
              </div>

              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                We found {nearbyIssues.length} existing issue{nearbyIssues.length > 1 ? "s" : ""} within 500m of your location.
                Consider supporting an existing report instead of creating a duplicate.
              </p>

              <div className="mt-4 space-y-2">
                {nearbyIssues.map(nearby => (
                  <div key={nearby.id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-neutral-900 p-3 shadow-sm border border-neutral-200 dark:border-neutral-800">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/issues/${nearby.id}`}
                        className="font-bold text-sm text-neutral-900 dark:text-white hover:underline truncate block"
                      >
                        {nearby.title}
                      </Link>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {nearby.distanceMeters}m away • {nearby.phase?.replace(/_/g, " ")} • {nearby.upvotes || 0} supporters
                      </p>
                    </div>
                    <Link
                      to={`/issues/${nearby.id}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-3 py-2 text-xs font-bold transition"
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
                className="mt-4 w-full rounded-xl border border-amber-400 px-4 py-2.5 text-sm font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
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
            className="w-full rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-5 py-3.5 font-bold transition shadow-md disabled:opacity-60 cursor-pointer"
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
            <div className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 p-4 text-sm font-semibold text-neutral-900 dark:text-white">
              {message}
            </div>
          )}

          {/* =================================================
              SIMILAR ISSUES
          ================================================= */}

          {similar.length > 0 && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 text-sm text-amber-900 dark:text-amber-200">

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

        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 shadow-sm">

          <div className="flex items-center justify-between gap-3">

            <div>

              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                Location
              </p>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Click the map or use your current position.
              </p>

            </div>

            <button
              type="button"
              onClick={useLocation}
              className="flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white px-3 py-2 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition cursor-pointer"
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

          <div className="mt-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 p-3 text-xs text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">

            <MapPin
              size={14}
              className="mr-1 inline text-black dark:text-white"
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
              <div className="mt-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-4">

                <p className="text-xs font-black uppercase text-neutral-900 dark:text-white">
                  AI detected location clues
                </p>

                <div className="mt-2 space-y-1">

                  {aiAnalysis.locationClues.visibleText.map(
                    (text, index) => (
                      <p
                        key={index}
                        className="text-xs text-neutral-700 dark:text-neutral-300"
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
              <div className="mt-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">

                <p className="text-xs font-black uppercase text-neutral-500 dark:text-neutral-400">
                  Detected landmarks
                </p>

                <div className="mt-2 space-y-1">

                  {aiAnalysis.locationClues.landmarks.map(
                    (landmark, index) => (
                      <p
                        key={index}
                        className="text-xs text-neutral-700 dark:text-neutral-300"
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