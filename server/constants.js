export const CATEGORIES = [
  { key: "road", label: "Road Damage", department: "Public Works", weight: 30 },
  { key: "garbage", label: "Garbage / Waste", department: "Sanitation", weight: 25 },
  { key: "streetlight", label: "Broken Streetlight", department: "Electricity", weight: 20 },
  { key: "water", label: "Water Leakage", department: "Water Department", weight: 35 },
  { key: "drainage", label: "Drainage / Flooding", department: "Public Works", weight: 40 },
  { key: "traffic", label: "Traffic / Signage", department: "Traffic Department", weight: 35 },
  { key: "other", label: "Other", department: "General Administration", weight: 10 }
];

export const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function categoryInfo(key) {
  return CATEGORIES.find((item) => item.key === key) || CATEGORIES.at(-1);
}

export function calculatePriority(categoryKey, upvotes = 0) {
  const base = categoryInfo(categoryKey).weight;
  const score = base + Math.min(upvotes * 2, 30);
  if (score >= 60) return { label: "URGENT", score };
  if (score >= 40) return { label: "HIGH", score };
  if (score >= 25) return { label: "MEDIUM", score };
  return { label: "LOW", score };
}
