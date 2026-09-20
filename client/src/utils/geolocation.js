/**
 * Robust geolocation service that fetches the user's real local coordinates.
 * Strategy:
 * 1. Checks sessionStorage cache for instant load
 * 2. Attempts high-accuracy browser GPS via navigator.geolocation
 * 3. In parallel/fallback, uses fast IP-based network location if GPS is denied or slow
 * 4. Reverse geocodes coordinates to get true locality & city name
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
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

export async function fetchLocalCoordinates() {
  // 1. Check cached position from session
  try {
    const cached = sessionStorage.getItem("civic_local_coords");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.lat && parsed.lng) {
        // Return cached immediately, then continue updating in background
        return parsed;
      }
    }
  } catch {}

  // 2. High accuracy browser GPS promise
  const gpsPromise = new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city = "Local Area";
        let locality = "";

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const geo = await res.json();
          city = geo.locality || geo.city || geo.principalSubdivision || "Local Area";
          locality = geo.locality || "";
        } catch {}

        const result = {
          lat,
          lng,
          city,
          locality,
          source: "gps",
          accuracy: pos.coords.accuracy
        };

        try {
          sessionStorage.setItem("civic_local_coords", JSON.stringify(result));
        } catch {}

        resolve(result);
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  });

  // 3. Fast IP-based coordinates promise as fallback/companion
  const ipPromise = async () => {
    try {
      const res = await fetch("https://ipwho.is/");
      const data = await res.json();
      if (data && data.success !== false && data.latitude && data.longitude) {
        const result = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || data.region || "Local Area",
          locality: data.city || "",
          source: "network",
          accuracy: 5000
        };
        try {
          sessionStorage.setItem("civic_local_coords", JSON.stringify(result));
        } catch {}
        return result;
      }
    } catch {}

    try {
      const res2 = await fetch("https://freeipapi.com/api/json");
      const data2 = await res2.json();
      if (data2 && data2.latitude && data2.longitude) {
        const result = {
          lat: data2.latitude,
          lng: data2.longitude,
          city: data2.cityName || data2.regionName || "Local Area",
          locality: data2.cityName || "",
          source: "network",
          accuracy: 5000
        };
        try {
          sessionStorage.setItem("civic_local_coords", JSON.stringify(result));
        } catch {}
        return result;
      }
    } catch {}

    // Default fallback coordinates if all fails (Connaught Place, New Delhi)
    return {
      lat: 28.6139,
      lng: 77.209,
      city: "New Delhi",
      locality: "Central Delhi",
      source: "default",
      accuracy: 10000
    };
  };

  // Try GPS with a 2.5 second timeout race against IP location
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("GPS timeout")), 2500)
    );
    return await Promise.race([gpsPromise, timeoutPromise]);
  } catch {
    // If GPS times out or errors, try IP-based location
    try {
      return await ipPromise();
    } catch {
      return {
        lat: 28.6139,
        lng: 77.209,
        city: "New Delhi",
        locality: "Central Delhi",
        source: "default"
      };
    }
  }
}
