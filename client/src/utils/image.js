/**
 * Utility to safely get the correct image URL regardless of format:
 * - Data URLs (data:image/jpeg;base64,...)
 * - Blob URLs (blob:...)
 * - Full URLs (http:// or https://)
 * - Relative upload paths (/uploads/...)
 */
export function getImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If already full data URI, blob URL, or http/https, return as-is
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  // If relative path like /uploads/..., prepend server host
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
