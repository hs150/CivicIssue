import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, Plus, Minus, ArrowRight, Clock, Crosshair, Sparkles, Compass } from "lucide-react";
import L from "leaflet";
import { api } from "../api.js";
import { getImageUrl } from "../utils/image.js";
import { fetchLocalCoordinates, getRealDeviceGps, reverseGeocode, calculateDistanceKm } from "../utils/geolocation.js";

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

function createUserLocationIcon() {
  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #3B82F6; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid white; box-shadow: 0 2px 10px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center;">
        <div style="width: 4px; height: 4px; border-radius: 50%; background: white;"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-user-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

export default function HeroMapWidget() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [cityLabel, setCityLabel] = useState("Locating your area...");
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [coordDetails, setCoordDetails] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [mapMode, setMapMode] = useState("satellite"); // "satellite" | "street"
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const satLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const streetLayerRef = useRef(null);

  // Explicit Hardware GPS Request Handler
  const requestDeviceGps = async () => {
    setIsLocating(true);
    try {
      const realGps = await getRealDeviceGps({ timeout: 15000 });
      if (realGps && realGps.lat && realGps.lng) {
        setUserLocation({ lat: realGps.lat, lng: realGps.lng });
        setCoordDetails(realGps);
        setCityLabel(realGps.city);

        if (mapRef.current) {
          mapRef.current.flyTo([realGps.lat, realGps.lng], 15, { duration: 1.2 });
        }
      }
    } catch (err) {
      console.warn("GPS request error:", err.message);
      // Inform user if permission is blocked in browser
      if (err.code === 1) {
        alert("Location access is currently blocked by your browser for this site.\n\nPlease click the lock or tune icon in your browser address bar and enable 'Location' permission.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  // 1. Initial Coordinate Fetch + Active Hardware GPS Watcher
  useEffect(() => {
    let watchId = null;

    // A. Initial fetch (real GPS or fast network approximation)
    fetchLocalCoordinates()
      .then((coords) => {
        if (coords && coords.lat && coords.lng) {
          setUserLocation({ lat: coords.lat, lng: coords.lng });
          setCoordDetails(coords);
          setCityLabel(coords.city || "Local Area");

          if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], 14);
          }
        }
      })
      .finally(() => setIsLocating(false));

    // B. Live Device GPS Watcher (locks onto true physical GPS as soon as browser resolves)
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const city = await reverseGeocode(lat, lng);
          const realGps = {
            lat,
            lng,
            city,
            accuracy: pos.coords.accuracy,
            source: "gps"
          };
          setUserLocation({ lat, lng });
          setCoordDetails(realGps);
          setCityLabel(city);
          setIsLocating(false);

          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 15, { duration: 1.0 });
          }
        },
        (err) => {
          console.warn("Live GPS watch notice:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // 2. Fetch real issues from backend
  useEffect(() => {
    let isMounted = true;
    async function loadIssues() {
      try {
        const { data } = await api.get("/issues");
        if (isMounted && Array.isArray(data?.issues) && data.issues.length > 0) {
          const list = data.issues;
          setIssues(list);
          setSelectedIssue(list[0]);
        }
      } catch (err) {
        console.error("Failed to load real issues for hero map:", err);
      }
    }

    loadIssues();
    return () => { isMounted = false; };
  }, []);

  // 3. Initialize Real Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Center initially on cached or default coordinates
    const initialCenter = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [28.6139, 77.2090];

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false
    }).setView(initialCenter, 13);

    // 1. High-Resolution Photographic Satellite Imagery (Esri World Imagery - 100% free, keyless, sub-meter clarity)
    const satLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        className: "leaflet-tile-satellite"
      }
    );
    satLayerRef.current = satLayer;

    // 2. High-Precision Road & City Landmark Overlay (shows roads, places, boundaries over the satellite image)
    const labelsLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        className: "leaflet-tile-satellite-labels"
      }
    );
    labelsLayerRef.current = labelsLayer;

    // 3. Vector OpenStreetMap Street Layer
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
        className: "leaflet-tile-street"
      }
    );
    streetLayerRef.current = streetLayer;

    // Default to Satellite View
    satLayer.addTo(map);
    labelsLayer.addTo(map);

    mapRef.current = map;

    // Invalidate map size after DOM settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Synchronize Satellite / Street Layer Mode Switch
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapMode === "satellite") {
      if (streetLayerRef.current && map.hasLayer(streetLayerRef.current)) {
        map.removeLayer(streetLayerRef.current);
      }
      if (satLayerRef.current && !map.hasLayer(satLayerRef.current)) {
        satLayerRef.current.addTo(map);
      }
      if (labelsLayerRef.current && !map.hasLayer(labelsLayerRef.current)) {
        labelsLayerRef.current.addTo(map);
      }
    } else {
      if (satLayerRef.current && map.hasLayer(satLayerRef.current)) {
        map.removeLayer(satLayerRef.current);
      }
      if (labelsLayerRef.current && map.hasLayer(labelsLayerRef.current)) {
        map.removeLayer(labelsLayerRef.current);
      }
      if (streetLayerRef.current && !map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  }, [mapMode]);

  // 4. Update User Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserLocationIcon(),
      zIndexOffset: 500
    }).addTo(map).bindPopup("<div style='font-size: 11px; font-weight: bold;'>📍 You are here</div>");
  }, [userLocation]);

  // 4. Update User Marker and center on local coordinates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserLocationIcon(),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(
      `<div style='font-family: system-ui; font-size: 11px; font-weight: bold; padding: 2px;'>
        📍 <strong>Your Local Coordinates</strong><br/>
        <span style='color: #64748B; font-weight: 500;'>
          ${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E
        </span>
      </div>`
    );
  }, [userLocation]);

  // 5. Update Markers and view with real issue locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validIssues = issues.filter(
      (i) => i && Number.isFinite(Number(i.latitude)) && Number.isFinite(Number(i.longitude))
    );

    validIssues.forEach((issue) => {
      const lat = Number(issue.latitude);
      const lng = Number(issue.longitude);

      const isSelected = selectedIssue?.id === issue.id;
      const marker = L.marker([lat, lng], {
        icon: createPinIcon(issue.priority, isSelected),
        zIndexOffset: isSelected ? 500 : 100
      }).addTo(map);

      marker.on("click", () => {
        setSelectedIssue(issue);
        setImgError(false);
      });

      markersRef.current.push(marker);
    });

    // Smart centering: center on user's local coordinates if available
    if (userLocation) {
      // Check if any issues are within local range (< 40 km)
      const nearbyIssues = validIssues.filter((i) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, i.latitude, i.longitude);
        return dist && Number(dist) < 40;
      });

      if (nearbyIssues.length > 0) {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          ...nearbyIssues.map((i) => [Number(i.latitude), Number(i.longitude)])
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        map.setView([userLocation.lat, userLocation.lng], 14);
      }
    } else if (validIssues.length > 0) {
      const bounds = L.latLngBounds(validIssues.map((i) => [Number(i.latitude), Number(i.longitude)]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [issues, selectedIssue?.id, userLocation]);

  // Real category breakdown counts
  const categoryCounts = {
    roads: issues.filter((i) => (i.category || "").toLowerCase().includes("road")).length,
    water: issues.filter((i) => (i.category || "").toLowerCase().includes("water")).length,
    waste: issues.filter(
      (i) =>
        (i.category || "").toLowerCase().includes("waste") ||
        (i.category || "").toLowerCase().includes("garbage")
    ).length,
    lighting: issues.filter(
      (i) =>
        (i.category || "").toLowerCase().includes("light") ||
        (i.category || "").toLowerCase().includes("electr")
    ).length,
    others: issues.filter((i) => {
      const c = (i.category || "").toLowerCase();
      return (
        !c.includes("road") &&
        !c.includes("water") &&
        !c.includes("waste") &&
        !c.includes("garbage") &&
        !c.includes("light")
      );
    }).length
  };

  // Zoom controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 });
    }
    requestDeviceGps();
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

  const distanceToSelected =
    userLocation && selectedIssue?.latitude && selectedIssue?.longitude
      ? calculateDistanceKm(userLocation.lat, userLocation.lng, selectedIssue.latitude, selectedIssue.longitude)
      : null;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#E2E8F0] bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-900/5 select-none overflow-hidden">
      {/* Top Bar of Map Widget with REAL data */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F1F5F9]">
        {/* Real Location Tag & Fetch Trigger */}
        <button
          type="button"
          onClick={requestDeviceGps}
          title="Click to detect your exact physical GPS coordinates"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-emerald-50/50 hover:border-[#00A881]/40 px-3 py-1 text-xs font-bold text-[#07111F] shadow-2xs transition-all cursor-pointer group"
        >
          <span className="flex h-2 w-2 relative">
            {isLocating ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A881] opacity-75" />
            ) : null}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${coordDetails?.source === 'gps' ? 'bg-[#00A881]' : 'bg-amber-500'}`} />
          </span>
          <MapPin size={13} className={coordDetails?.source === 'gps' ? "text-[#00A881]" : "text-amber-600"} />
          <span className="max-w-[180px] sm:max-w-[220px] truncate">{cityLabel}</span>
          <span className="text-[10px] font-mono font-normal text-slate-400 hidden sm:inline">
            {coordDetails?.source === 'gps' ? '• GPS Locked' : '• Tap for GPS'}
          </span>
          <Crosshair size={11} className="text-[#94A3B8] group-hover:text-[#00A881] ml-0.5 transition-colors" />
        </button>

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

        {/* Layer Mode Switcher: 🛰️ Satellite vs 🗺️ Street */}
        <div className="absolute right-3.5 top-3.5 z-20 flex items-center rounded-xl border border-white/20 bg-slate-950/85 p-0.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMapMode("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
              mapMode === "satellite"
                ? "bg-[#00A881] text-white shadow-xs ring-1 ring-[#00A881]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title="High-Resolution True-Color Satellite Imagery"
          >
            <span>🛰️</span>
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode("street")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
              mapMode === "street"
                ? "bg-[#00A881] text-white shadow-xs ring-1 ring-[#00A881]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title="Standard Vector Street Map"
          >
            <span>🗺️</span>
            <span>Street</span>
          </button>
        </div>

        {/* Floating Active Issue Card with REAL DATA */}
        {selectedIssue && (
          <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-20 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-white/95 p-2.5 sm:p-3 shadow-lg backdrop-blur-md max-w-[290px] sm:max-w-[320px]">
            {/* Real Thumbnail Image */}
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
              {!imgError && getImageUrl(selectedIssue.imageUrl) ? (
                <img
                  src={getImageUrl(selectedIssue.imageUrl)}
                  alt={selectedIssue.title}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
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
                <span>
                  {selectedIssue.address ||
                    `${Number(selectedIssue.latitude).toFixed(4)}, ${Number(selectedIssue.longitude).toFixed(4)}`}
                </span>
              </p>

              {distanceToSelected && (
                <p className="text-[10px] text-[#00A881] font-semibold flex items-center gap-1 mt-0.5">
                  <span>📍 {distanceToSelected} km from you</span>
                </p>
              )}

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
            title="Recenter to my local coordinates"
          >
            <Navigation size={12} />
          </button>
        </div>
      </div>

    </div>
  );
}
