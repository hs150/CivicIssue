import { useEffect, useRef } from "react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function MapPicker({ value, onChange, readOnly = false }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const center = [value?.latitude || 28.6139, value?.longitude || 77.2090];
    const map = L.map(ref.current).setView(center, 14);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      className: "leaflet-tile-satellite"
    }).addTo(map);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      className: "leaflet-tile-satellite-labels"
    }).addTo(map);

    mapRef.current = map;

    if (!readOnly) {
      map.on("click", e => onChange({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6))
      }));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value?.latitude || !value?.longitude) return;

    const latLng = [value.latitude, value.longitude];
    map.setView(latLng, Math.max(map.getZoom(), 14));

    if (!markerRef.current) {
      markerRef.current = L.marker(latLng).addTo(map);
    } else {
      markerRef.current.setLatLng(latLng);
    }
  }, [value]);

  return <div ref={ref} className="h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200" />;
}
