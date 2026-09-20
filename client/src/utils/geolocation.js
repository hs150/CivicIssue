/**
 * Geolocation service prioritizing real hardware/browser GPS coordinates.
 * - Always requests high-accuracy device GPS first.
 * - Listens for live location updates via watchPosition.
 * - Never permanently locks onto approximate IP data.
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

/**
 * Reverse-geocode coordinates to get human-readable locality, city, and state
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    const parts = [
      data.locality || data.localityInfo?.administrative?.[3]?.name,
      data.city || data.principalSubdivision
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
  } catch {
    return `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
  }
}

/**
 * Request real device GPS coordinates directly from the browser.
 * Returns a Promise that resolves with { lat, lng, city, accuracy, source: 'gps' }.
 */
export function getRealDeviceGps(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const city = await reverseGeocode(lat, lng);

        const result = {
          lat,
          lng,
          city,
          accuracy,
          source: "gps",
          timestamp: Date.now()
        };

        // Cache real GPS in session
        try {
          sessionStorage.setItem("civic_gps_coords", JSON.stringify(result));
        } catch {}

        resolve(result);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: options.timeout || 15000,
        maximumAge: options.maximumAge || 0
      }
    );
  });
}

/**
 * Fetch local coordinates:
 * 1. Checks if recent real GPS coordinates are already in memory/session.
 * 2. Attempts real device GPS.
 * 3. Only if GPS is unavailable or blocked, falls back to IP estimate with source: 'ip_fallback'.
 */
export async function fetchLocalCoordinates() {
  // Check if we already have verified real GPS coordinates
  try {
    const cached = sessionStorage.getItem("civic_gps_coords");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.source === "gps" && parsed.lat && parsed.lng) {
        // If less than 10 minutes old, return it
        if (Date.now() - (parsed.timestamp || 0) < 10 * 60 * 1000) {
          return parsed;
        }
      }
    }
  } catch {}

  // Attempt real hardware GPS first (allow up to 10s for Windows/browser location provider)
  try {
    const gpsResult = await getRealDeviceGps({ timeout: 10000 });
    return gpsResult;
  } catch (gpsError) {
    console.warn("Browser GPS not available or denied, checking fallback:", gpsError.message);
  }

  // Fallback: network IP location (marks source as 'ip_fallback' so UI knows it's approximate)
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (data && data.success !== false && data.latitude && data.longitude) {
      const city = await reverseGeocode(data.latitude, data.longitude);
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: city || data.city || "Local Area",
        accuracy: 10000,
        source: "ip_fallback"
      };
    }
  } catch {}

  // Last resort default
  return {
    lat: 28.6139,
    lng: 77.209,
    city: "New Delhi",
    source: "default"
  };
}
