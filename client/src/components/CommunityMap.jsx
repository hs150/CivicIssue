import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { getImageUrl } from "../utils/image.js";
import { fetchLocalCoordinates } from "../utils/geolocation.js";

const MARKER_COLORS = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#64748B"
};

function createPinIcon(priority = "MEDIUM") {
  const color = MARKER_COLORS[priority] || MARKER_COLORS.MEDIUM;
  const svgHtml = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });
}

function createUserMarker() {
  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #3B82F6; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563EB; border: 3px solid white; box-shadow: 0 2px 10px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center;"></div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-user-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

export default function CommunityMap({ issues = [], height = "520px" }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapMode, setMapMode] = useState("satellite"); // "satellite" | "street"
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const satLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const streetLayerRef = useRef(null);

  // 1. Fetch Local Coordinates
  useEffect(() => {
    fetchLocalCoordinates()
      .then((coords) => {
        if (coords && coords.lat && coords.lng) {
          setUserLocation({ lat: coords.lat, lng: coords.lng, city: coords.city });
          if (mapRef.current) {
            mapRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
          }
        }
      })
      .catch(() => {});
  }, []);

  // 2. Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [28.6139, 77.2090];

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(initialCenter, 13);

    // 1. Google High-Resolution Latest Satellite Imagery (Fresh, continuously updated satellite + modern roads/landmarks)
    const satLayer = L.tileLayer(
      "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        maxZoom: 21,
        subdomains: ["0", "1", "2", "3"],
        className: "leaflet-tile-satellite"
      }
    );
    satLayerRef.current = satLayer;

    // 2. Vector OpenStreetMap Street Layer
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
        className: "leaflet-tile-street"
      }
    );
    streetLayerRef.current = streetLayer;

    // Default to Latest Satellite View
    satLayer.addTo(map);

    mapRef.current = map;

    return () => {
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
    } else {
      if (satLayerRef.current && map.hasLayer(satLayerRef.current)) {
        map.removeLayer(satLayerRef.current);
      }
      if (streetLayerRef.current && !map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  }, [mapMode]);

  // 3. Update User Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserMarker(),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(
      `<div style="font-family: system-ui; font-size: 11px; font-weight: bold; padding: 2px;">
        📍 <strong>Your Local Coordinates</strong><br/>
        <span style="color: #64748b;">${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E (${userLocation.city || "Local"})</span>
      </div>`
    );
  }, [userLocation]);

  // Update markers when issues change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validIssues = issues.filter(
      (i) =>
        i &&
        Number.isFinite(Number(i.latitude || i.location?.latitude)) &&
        Number.isFinite(Number(i.longitude || i.location?.longitude))
    );

    if (!validIssues.length) return;

    const bounds = L.latLngBounds();

    validIssues.forEach((issue) => {
      const lat = Number(issue.latitude || issue.location?.latitude);
      const lng = Number(issue.longitude || issue.location?.longitude);
      const priority = (issue.priority || "MEDIUM").toUpperCase();
      const phase = (issue.phase || issue.status || "NEW").replace(/_/g, " ");
      const issueId = issue._id || issue.id;

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(priority)
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 2px; max-width: 240px;">
          ${
            getImageUrl(issue.imageUrl)
              ? `<img src="${getImageUrl(issue.imageUrl)}" alt="" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ""
          }
          <div style="display: flex; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 9999px;">${phase}</span>
            <span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 9999px;">${priority}</span>
          </div>
          <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0; line-height: 1.3;">
            ${issue.title}
          </p>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${issue.location?.address || issue.address || "Location pinned"}
          </p>
          <a href="/issues/${issueId}" style="display: block; text-align: center; background: #047857; color: white; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;">
            View Full Report →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(map);
      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    if (markersRef.current.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [issues]);

  return (
    <div
      style={{ height, width: "100%" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
    >
      <div ref={containerRef} className="h-full w-full z-0" />

      {/* Layer Mode Switcher: 🛰️ Satellite vs 🗺️ Street */}
      <div className="absolute right-3.5 top-3.5 z-[1000] flex items-center rounded-xl border border-white/20 bg-slate-950/85 p-0.5 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMapMode("satellite")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
            mapMode === "satellite"
              ? "bg-white text-black shadow-xs ring-1 ring-white"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
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
              ? "bg-white text-black shadow-xs ring-1 ring-white"
              : "text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
          title="Standard Vector Street Map"
        >
          <span>🗺️</span>
          <span>Street</span>
        </button>
      </div>
    </div>
  );
}
