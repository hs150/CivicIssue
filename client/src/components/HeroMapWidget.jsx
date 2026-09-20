import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, Plus, Minus, ArrowRight, Clock } from "lucide-react";
import L from "leaflet";
import { api } from "../api.js";
import { getImageUrl } from "../utils/image.js";

const MARKER_COLORS = {
  URGENT: "#EF4444",
  CRITICAL: "#EF4444",
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#00A881",
  RESOLVED: "#00A881"
};

function createPinIcon(priority = "MEDIUM", isSelected = false) {
  const color = MARKER_COLORS[(priority || "").toUpperCase()] || "#00A881";
  const size = isSelected ? 34 : 26;
  const innerSize = isSelected ? 24 : 18;

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${isSelected ? `<div style="position: absolute; width: ${size + 12}px; height: ${size + 12}px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
      <div style="width: ${innerSize}px; height: ${innerSize}px; border-radius: 50%; background: ${color}; border: ${isSelected ? "3px" : "2px"} solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-hero-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

export default function HeroMapWidget() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [cityLabel, setCityLabel] = useState("Live Radar");
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 1. Fetch real issues from backend
  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          const list = data.issues;
          setIssues(list);
          setSelectedIssue(list[0]);

          // Determine city label from real data
          const first = list[0];
          if (first.address) {
            setCityLabel(first.address.split(",")[0].trim());
          } else if (first.latitude && first.longitude) {
            // Check known coordinates (Delhi/Varanasi)
            if (Math.abs(first.latitude - 28.6139) < 1.0) {
              setCityLabel("New Delhi");
            } else if (Math.abs(first.latitude - 25.3176) < 1.0) {
              setCityLabel("Varanasi");
            } else {
              setCityLabel(`${first.latitude.toFixed(2)}°N, ${first.longitude.toFixed(2)}°E`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load real issues for hero map:", err);
      }
    }

    loadIssues();
    return () => { isMounted = false; };
  }, []);

  // 2. Initialize Real Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default center
    const defaultCenter = [28.6139, 77.2090];
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView(defaultCenter, 13);

    // Modern clean CartoDB Positron tiles (looks like screenshot's high-tech civic map)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Update Markers and view with real issue locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const validIssues = issues.filter(
      i => i && Number.isFinite(Number(i.latitude)) && Number.isFinite(Number(i.longitude))
    );

    if (validIssues.length === 0) return;

    const bounds = L.latLngBounds();

    validIssues.forEach((issue) => {
      const lat = Number(issue.latitude);
      const lng = Number(issue.longitude);
      bounds.extend([lat, lng]);

      const isSelected = selectedIssue?.id === issue.id;
      const marker = L.marker([lat, lng], {
        icon: createPinIcon(issue.priority, isSelected),
        zIndexOffset: isSelected ? 1000 : 100
      }).addTo(map);

      marker.on("click", () => {
        setSelectedIssue(issue);
      });

      markersRef.current.push(marker);
    });

    if (validIssues.length === 1) {
      map.setView([validIssues[0].latitude, validIssues[0].longitude], 14);
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [issues, selectedIssue?.id]);

  // Real category breakdown counts
  const categoryCounts = {
    roads: issues.filter(i => (i.category || "").toLowerCase().includes("road")).length,
    water: issues.filter(i => (i.category || "").toLowerCase().includes("water")).length,
    waste: issues.filter(i => (i.category || "").toLowerCase().includes("waste") || (i.category || "").toLowerCase().includes("garbage")).length,
    lighting: issues.filter(i => (i.category || "").toLowerCase().includes("light") || (i.category || "").toLowerCase().includes("electr")).length,
    others: issues.filter(i => {
      const c = (i.category || "").toLowerCase();
      return !c.includes("road") && !c.includes("water") && !c.includes("waste") && !c.includes("garbage") && !c.includes("light");
    }).length
  };

  // Zoom controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (selectedIssue && selectedIssue.latitude && selectedIssue.longitude) {
      mapRef.current.setView([selectedIssue.latitude, selectedIssue.longitude], 14, { animate: true });
    }
  };

  // Calculate friendly relative time
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs < 24) return `${diffHrs} hours ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-900/5 select-none overflow-hidden">
      
      {/* Top Bar of Map Widget with REAL data */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
        {/* Real Location Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#07111F] shadow-2xs">
          <MapPin size={13} className="text-[#00A881]" />
          <span>{cityLabel}</span>
          <span className="text-[10px] text-[#94A3B8]">▾</span>
        </div>

        {/* Real Category Counts from database */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span>Roads</span> <strong className="text-[#07111F]">{categoryCounts.roads}</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span>Water</span> <strong className="text-[#07111F]">{categoryCounts.water}</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>Waste</span> <strong className="text-[#07111F]">{categoryCounts.waste}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EAB308]" />
            <span>Lighting</span> <strong className="text-[#07111F]">{categoryCounts.lighting}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />
            <span>Others</span> <strong className="text-[#07111F]">{categoryCounts.others}</strong>
          </span>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Canvas */}
      <div className="relative mt-3 h-[300px] sm:h-[360px] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#E2E8F0]">
        
        {/* Leaflet DOM container */}
        <div ref={containerRef} className="h-full w-full z-0" />

        {/* Floating Active Issue Card with REAL DATA */}
        {selectedIssue && (
          <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-20 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-md max-w-[290px] sm:max-w-[320px]">
            {/* Real Thumbnail Image */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
              {getImageUrl(selectedIssue.imageUrl) ? (
                <img
                  src={getImageUrl(selectedIssue.imageUrl)}
                  alt={selectedIssue.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MapPin size={22} className="text-[#00A881]" />
              )}
            </div>

            {/* Real Issue Details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#07111F] truncate" title={selectedIssue.title}>
                  {selectedIssue.title}
                </h4>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-[#EF4444] shrink-0 border border-rose-100">
                  <span className="h-1 w-1 rounded-full bg-[#EF4444]" /> {selectedIssue.priority || "Medium"}
                </span>
              </div>

              <p className="mt-1 text-[11px] text-[#64748B] flex items-center gap-1 truncate">
                <MapPin size={10} className="text-[#94A3B8] shrink-0" />
                <span>{selectedIssue.address || `${Number(selectedIssue.latitude).toFixed(4)}, ${Number(selectedIssue.longitude).toFixed(4)}`}</span>
              </p>

              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                  <Clock size={10} /> {getTimeAgo(selectedIssue.createdAt)}
                </span>
                <Link
                  to={`/issues/${selectedIssue.id}`}
                  className="text-xs font-bold text-[#00A881] hover:translate-x-0.5 transition-transform"
                  title="Open ticket"
                >
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Real Leaflet Map Controls on Right */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col rounded-xl border border-[#E2E8F0] bg-white shadow-md overflow-hidden text-[#64748B]">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer"
            title="Zoom in"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer"
            title="Zoom out"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="flex h-7 w-7 items-center justify-center hover:bg-slate-50 transition text-[#00A881] cursor-pointer"
            title="Recenter location"
          >
            <Navigation size={12} />
          </button>
        </div>

      </div>

    </div>
  );
}
