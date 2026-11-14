import "dotenv/config";
import { query, pool } from "./db/index.js";
import { randomUUID } from "crypto";

async function seedIssues() {
  console.log("🌱 Seeding initial sample civic issues...");

  // Find citizen user to associate reports with
  const userRes = await query("SELECT id FROM users WHERE email = 'citizen@civicconnect.demo' LIMIT 1;");
  if (userRes.rowCount === 0) {
    console.warn("⚠️ Demo citizen user not found. Please run 'npm run seed' to seed users first.");
    return;
  }

  const citizenId = userRes.rows[0].id;

  const sampleIssues = [
    {
      code: "CC-84192",
      title: "Deep Pothole & Road Caving Near Crossing",
      description: "Severe road deterioration with exposed gravel causing hazardous vehicle diversions.",
      category: "road",
      department: "Public Works",
      latitude: 25.3134,
      longitude: 82.9862,
      address: "Near Sigra Crossing, Varanasi",
      priority: "HIGH",
      priorityScore: 75,
      status: "NEW",
      phase: "NEW"
    },
    {
      code: "CC-84193",
      title: "Damaged Street Light Pole Creating Dark Stretch",
      description: "Main streetlight fixture completely unlit, creating a safety hazard for pedestrians after sunset.",
      category: "streetlight",
      department: "Electricity",
      latitude: 25.3089,
      longitude: 83.0068,
      address: "Godowlia Market Main Lane, Varanasi",
      priority: "MEDIUM",
      priorityScore: 50,
      status: "IN_PROGRESS",
      phase: "IN_PROGRESS"
    },
    {
      code: "CC-84194",
      title: "Commercial Waste Bin Overflow On Walkway",
      description: "Municipal waste bin overflowing onto the pedestrian pathway, blocking foot traffic and causing sanitation concerns.",
      category: "garbage",
      department: "Sanitation",
      latitude: 25.2982,
      longitude: 83.0039,
      address: "Assi Ghat Riverfront Road, Varanasi",
      priority: "URGENT",
      priorityScore: 85,
      status: "NEW",
      phase: "NEW"
    },
    {
      code: "CC-84195",
      title: "Potable Water Pipeline Leakage",
      description: "Underground clean water pipeline leaking onto the roadway, resulting in continuous standing water accumulation.",
      category: "water",
      department: "Water Department",
      latitude: 25.3211,
      longitude: 82.9984,
      address: "Cantonment Road, Varanasi",
      priority: "HIGH",
      priorityScore: 70,
      status: "NEW",
      phase: "NEW"
    }
  ];

  for (const item of sampleIssues) {
    const existing = await query("SELECT id FROM issues WHERE issue_code = $1", [item.code]);
    if (existing.rowCount > 0) {
      console.log(`⏩ [Skipping] ${item.code} (already present)`);
      continue;
    }

    const issueId = randomUUID();
    await query(
      `
      INSERT INTO issues (
        id,
        issue_code,
        title,
        description,
        category,
        department,
        latitude,
        longitude,
        address,
        reported_by,
        status,
        phase,
        priority,
        priority_score,
        upvotes,
        conditions,
        ai_analysis
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, '{}'::jsonb, '{}'::jsonb)
      `,
      [
        issueId,
        item.code,
        item.title,
        item.description,
        item.category,
        item.department,
        item.latitude,
        item.longitude,
        item.address,
        citizenId,
        item.status,
        item.phase,
        item.priority,
        item.priorityScore
      ]
    );

    console.log(`✅ Seeded issue: ${item.code} - ${item.title}`);
  }

  console.log("🎉 Sample civic issues seeded successfully!");
}

seedIssues()
  .catch((e) => console.error("Seeding issues failed:", e))
  .finally(() => pool.end());
