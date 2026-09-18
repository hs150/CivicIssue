import { categoryInfo, calculatePriority } from "../constants.js";

export function buildIssueFields({ category, upvotes = 0 }) {
  const info = categoryInfo(category);
  const priority = calculatePriority(category, upvotes);

  return {
    category,
    department: info.department,
    priority: priority.label,
    priorityScore: priority.score
  };
}

export function distanceMeters(a, b) {
  const R = 6371000;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;

  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
