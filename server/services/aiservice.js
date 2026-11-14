import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export const MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

export const FALLBACK_MODELS = [
    process.env.GEMINI_MODEL,
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-3.8-flash"
].filter(Boolean);

function getAIClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
}

async function generateWithFallback(ai, params) {
    let lastError = null;
    for (const model of FALLBACK_MODELS) {
        try {
            const response = await ai.models.generateContent({
                ...params,
                model
            });
            return { response, modelUsed: model };
        } catch (err) {
            lastError = err;
            const msg = err?.message || "";
            if (
                err?.status === 404 ||
                msg.includes("404") ||
                msg.includes("not found") ||
                msg.includes("no longer available")
            ) {
                console.warn(`[AI] Model '${model}' unavailable, trying next fallback model...`);
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

/*
=========================================================
SAFE JSON PARSER
=========================================================
*/

function parseAIJson(text) {
    if (!text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    let cleaned = text.trim();

    // Remove markdown fences if Gemini returns them.
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
}

/*
=========================================================
NORMALIZE AI RESULT
=========================================================
*/

function normalizeAssessment(data, modelUsed = MODEL) {
    const safeData = data && typeof data === "object" ? data : {};

    const rawCategory = safeData.issue?.category ? String(safeData.issue.category).toUpperCase() : "OTHER";
    const rawSeverity = safeData.issue?.severity ? String(safeData.issue.severity).toUpperCase() : "MEDIUM";
    const rawPriority = safeData.issue?.priority ? String(safeData.issue.priority).toUpperCase() : "MEDIUM";

    const validSeverities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const severity = validSeverities.includes(rawSeverity) ? rawSeverity : "MEDIUM";
    const priority = validSeverities.includes(rawPriority) ? rawPriority : "MEDIUM";

    return {
        issue: {
            category: rawCategory,
            subcategory: safeData.issue?.subcategory || "UNSPECIFIED",
            description: safeData.issue?.description || "Civic issue detected from uploaded image.",
            severity,
            priority
        },
        visualEvidence: {
            objects: Array.isArray(safeData.visualEvidence?.objects)
                ? safeData.visualEvidence.objects
                : [],
            damage: safeData.visualEvidence?.damage || {
                detected: false,
                type: "UNKNOWN",
                estimatedExtent: "UNKNOWN"
            }
        },
        safety: {
            hazardDetected: Boolean(safeData.safety?.hazardDetected),
            hazardType: Array.isArray(safeData.safety?.hazardType)
                ? safeData.safety.hazardType
                : [],
            riskLevel: safeData.safety?.riskLevel || "UNKNOWN"
        },
        locationClues: {
            visibleText: Array.isArray(safeData.locationClues?.visibleText)
                ? safeData.locationClues.visibleText
                : [],
            landmarks: Array.isArray(safeData.locationClues?.landmarks)
                ? safeData.locationClues.landmarks
                : [],
            roadSigns: Array.isArray(safeData.locationClues?.roadSigns)
                ? safeData.locationClues.roadSigns
                : []
        },
        environment: {
            weather: safeData.environment?.weather || "UNKNOWN",
            lighting: safeData.environment?.lighting || "UNKNOWN"
        },
        evidence: {
            imageQuality: safeData.evidence?.imageQuality || "UNKNOWN",
            relevant: safeData.evidence?.relevant !== false,
            suspicious: Boolean(safeData.evidence?.suspicious),
            confidence: Number(safeData.evidence?.confidence || 0)
        },
        routing: {
            department: safeData.routing?.department || "General Civic Services",
            recommendedAction: safeData.routing?.recommendedAction || "Manual inspection required."
        },
        ai: {
            model: modelUsed || MODEL,
            requiresHumanReview: Boolean(safeData.ai?.requiresHumanReview)
        }
    };
}

/*
=========================================================
IMAGE-FIRST CIVIC ISSUE ANALYSIS
=========================================================
*/

export async function analyzeIssueImage({

    imageBuffer,

    mimeType = "image/jpeg",

    citizenDescription = ""

}) {

    const ai = getAIClient();

    if (!imageBuffer) {

        throw new Error(
            "Image is required for AI analysis."
        );

    }

    if (!ai) {

        return {

            issue: {

                category: "OTHER",

                subcategory: "AI_UNAVAILABLE",

                description:
                    citizenDescription ||
                    "Manual civic issue review required.",

                severity: "MEDIUM",

                priority: "MEDIUM"

            },

            visualEvidence: {

                objects: [],

                damage: {

                    detected: false,

                    type: "UNKNOWN",

                    estimatedExtent: "UNKNOWN"

                }

            },

            safety: {

                hazardDetected: false,

                hazardType: [],

                riskLevel: "UNKNOWN"

            },

            locationClues: {

                visibleText: [],

                landmarks: [],

                roadSigns: []

            },

            environment: {

                weather: "UNKNOWN",

                lighting: "UNKNOWN"

            },

            evidence: {

                imageQuality: "UNKNOWN",

                relevant: null,

                suspicious: false,

                confidence: 0

            },

            routing: {

                department:
                    "General Civic Services",

                recommendedAction:
                    "Manual inspection required."

            },

            ai: {

                model: MODEL,

                requiresHumanReview: true

            }

        };

    }

    const base64Image =
        imageBuffer.toString("base64");

    const prompt = `

You are CivicConnect Vision AI.

Your task is to analyze a citizen-uploaded image
for a civic issue reporting platform.

IMAGE ANALYSIS MUST BE IMAGE-FIRST.

Analyze EVERYTHING reasonably observable.

Do not invent information that cannot be supported
by the image.

If something cannot be determined, use UNKNOWN.

Analyze:

1. Civic issue category
2. Subcategory
3. Detailed visual description
4. Severity
5. Priority
6. Visible objects
7. Damage
8. Safety hazards
9. Risk level
10. Visible text
11. Road signs
12. Landmarks
13. Environmental conditions
14. Lighting
15. Image quality
16. Whether the image is relevant to a civic issue
17. Whether the image appears suspicious or manipulated
18. Confidence
19. Appropriate government department
20. Recommended action
21. Whether human review is necessary

IMPORTANT:

- Do NOT fabricate GPS coordinates.
- Do NOT claim an exact address from visual inference.
- Extract visible text exactly when possible.
- If location clues exist, report them as clues only.
- Do not diagnose people medically.
- Do not identify private individuals.
- Focus on infrastructure, public spaces and civic conditions.
- Separate visible facts from inference.
- If evidence is insufficient, lower confidence.
- High-risk or ambiguous cases should require human review.

CATEGORY OPTIONS:

ROAD
GARBAGE
STREETLIGHT
WATER
DRAINAGE
ELECTRICITY
TRAFFIC
PUBLIC_SAFETY
PARK
SANITATION
PUBLIC_PROPERTY
OTHER

SEVERITY:

LOW
MEDIUM
HIGH
URGENT

PRIORITY:

LOW
MEDIUM
HIGH
URGENT

RISK:

LOW
MEDIUM
HIGH
URGENT
UNKNOWN

IMAGE QUALITY:

LOW
MEDIUM
HIGH
UNKNOWN

${citizenDescription
    ? `
OPTIONAL CITIZEN DESCRIPTION:

${citizenDescription}

Use this only as supporting context.
The image remains the primary evidence source.
`
    : ""
}

RETURN ONLY VALID JSON.

Schema:

{
  "issue": {
    "category": "ROAD|GARBAGE|STREETLIGHT|WATER|DRAINAGE|ELECTRICITY|TRAFFIC|PUBLIC_SAFETY|PARK|SANITATION|PUBLIC_PROPERTY|OTHER",
    "subcategory": "string",
    "description": "string",
    "severity": "LOW|MEDIUM|HIGH|URGENT",
    "priority": "LOW|MEDIUM|HIGH|URGENT"
  },

  "visualEvidence": {
    "objects": ["string"],
    "damage": {
      "detected": true,
      "type": "string",
      "estimatedExtent": "string"
    }
  },

  "safety": {
    "hazardDetected": true,
    "hazardType": ["string"],
    "riskLevel": "LOW|MEDIUM|HIGH|URGENT|UNKNOWN"
  },

  "locationClues": {
    "visibleText": ["string"],
    "landmarks": ["string"],
    "roadSigns": ["string"]
  },

  "environment": {
    "weather": "string",
    "lighting": "string"
  },

  "evidence": {
    "imageQuality": "LOW|MEDIUM|HIGH|UNKNOWN",
    "relevant": true,
    "suspicious": false,
    "confidence": 0.0
  },

  "routing": {
    "department": "string",
    "recommendedAction": "string"
  },

  "ai": {
    "requiresHumanReview": false
  }
}
`;

    try {
        const { response, modelUsed } = await generateWithFallback(ai, {
            contents: [
                {
                    inlineData: {
                        mimeType,
                        data: base64Image
                    }
                },
                {
                    text: prompt
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        const raw =
            response.text?.trim();

        const parsed =
            parseAIJson(raw);

        return normalizeAssessment(
            parsed,
            modelUsed
        );

    } catch (error) {

        console.error(
            "Gemini Vision analysis failed:",
            error
        );

        return {

            issue: {

                category: "OTHER",

                subcategory:
                    "AI_REVIEW_REQUIRED",

                description:
                    citizenDescription ||
                    "Image requires manual review.",

                severity: "MEDIUM",

                priority: "MEDIUM"

            },

            visualEvidence: {

                objects: [],

                damage: {

                    detected: false,

                    type: "UNKNOWN",

                    estimatedExtent:
                        "UNKNOWN"

                }

            },

            safety: {

                hazardDetected: false,

                hazardType: [],

                riskLevel: "UNKNOWN"

            },

            locationClues: {

                visibleText: [],

                landmarks: [],

                roadSigns: []

            },

            environment: {

                weather: "UNKNOWN",

                lighting: "UNKNOWN"

            },

            evidence: {

                imageQuality: "UNKNOWN",

                relevant: null,

                suspicious: false,

                confidence: 0

            },

            routing: {

                department:
                    "General Civic Services",

                recommendedAction:
                    "Manual inspection required."

            },

            ai: {

                model: MODEL,

                requiresHumanReview: true

            }

        };

    }

}

/*
=========================================================
TEXT ANALYSIS
=========================================================
*/

export async function analyzeIssue({

    title = "",

    description = ""

}) {

    const ai = getAIClient();
    if (!ai) {

        return {

            category: "OTHER",

            severity: "MEDIUM",

            confidence: 0,

            department:
                "General Civic Services",

            reason:
                "Gemini unavailable or API key not configured.",

            provider: "fallback"

        };

    }

    try {

        const { response, modelUsed } =
            await generateWithFallback(ai, {

                contents: `

Classify this civic complaint.

TITLE:
${title}

DESCRIPTION:
${description}

Return ONLY JSON:

{
  "category": "ROAD|GARBAGE|STREETLIGHT|WATER|DRAINAGE|ELECTRICITY|TRAFFIC|PUBLIC_SAFETY|PARK|SANITATION|PUBLIC_PROPERTY|OTHER",
  "severity": "LOW|MEDIUM|HIGH|URGENT",
  "confidence": 0.0,
  "department": "string",
  "reason": "string"
}
`,

                config: {

                    responseMimeType:
                        "application/json"

                }

            });

        const result =
            parseAIJson(
                response.text
            );

        return {

            ...result,

            provider: "gemini",

            model: modelUsed

        };

    } catch (error) {

        console.error(
            "AI analysis text analysis failed:",
            error.message
        );

        return {

            category: "OTHER",

            severity: "MEDIUM",

            confidence: 0,

            department:
                "General Civic Services",

            reason:
                "AI analysis failed; manual review required.",

            provider: "fallback"

        };

    }

}

/*
=========================================================
PROOF-OF-FIX VERIFICATION (Before vs After)
=========================================================
*/

export async function verifyFix({

    beforeImageUrl,

    afterImageBuffer,

    afterMimeType = "image/jpeg",

    issueDescription = ""

}) {

    const ai = getAIClient();

    const fallback = {
        verified: false,
        confidence: 0,
        matchScore: 0,
        locationMatch: "UNKNOWN",
        issueAddressed: "UNKNOWN",
        summary: "AI verification unavailable.",
        concerns: ["AI service not configured."],
        provider: "fallback"
    };

    if (!ai) return fallback;

    if (!afterImageBuffer) {
        return {
            ...fallback,
            summary: "No proof-of-fix image provided.",
            concerns: ["After image is missing."]
        };
    }

    const afterBase64 =
        afterImageBuffer.toString("base64");

    // Build content parts
    const parts = [];

    // If beforeImageUrl is a base64 data URI, extract and include it
    if (beforeImageUrl && beforeImageUrl.startsWith("data:")) {
        const match = beforeImageUrl.match(
            /^data:(image\/\w+);base64,(.+)$/
        );
        if (match) {
            parts.push({
                inlineData: {
                    mimeType: match[1],
                    data: match[2]
                }
            });
        }
    } else if (beforeImageUrl && beforeImageUrl.startsWith("http")) {
        // For remote URLs, instruct Gemini via text
        parts.push({
            text: `BEFORE IMAGE URL (the original civic issue): ${beforeImageUrl}`
        });
    }

    // After image (always inline)
    parts.push({
        inlineData: {
            mimeType: afterMimeType,
            data: afterBase64
        }
    });

    const prompt = `
You are CivicConnect Fix Verification AI — an anti-corruption tool.

You are given TWO images:
1. BEFORE: The original civic issue photo (reported by a citizen).
2. AFTER: A proof-of-fix photo submitted by a government officer claiming the issue is resolved.

ISSUE DESCRIPTION:
${issueDescription || "No description provided."}

ANALYZE AND COMPARE:

1. LOCATION MATCH: Do both images appear to show the same location?
   Look for matching buildings, roads, landmarks, surroundings.

2. ISSUE ADDRESSED: Does the AFTER image show evidence that the
   reported issue has been fixed or improved?

3. SUSPICION CHECK: Look for signs of fraud:
   - Stock photos or internet-sourced images
   - Completely different locations
   - Image manipulation artifacts
   - Photos taken at impossible angles
   - Weather/lighting mismatch suggesting different times

4. CONFIDENCE: How confident are you in the verification (0.0 to 1.0)?

5. MATCH SCORE: How well do the before/after locations match (0.0 to 1.0)?

RETURN ONLY VALID JSON:

{
  "verified": true,
  "confidence": 0.85,
  "matchScore": 0.9,
  "locationMatch": "MATCH|PARTIAL|MISMATCH|UNKNOWN",
  "issueAddressed": "FIXED|PARTIALLY_FIXED|NOT_FIXED|UNKNOWN",
  "summary": "string describing what changed between before and after",
  "concerns": ["array of any concerns or red flags"]
}
`;

    parts.push({ text: prompt });

    try {

        const { response, modelUsed } =
            await generateWithFallback(ai, {
                contents: parts,
                config: {
                    responseMimeType:
                        "application/json"
                }
            });

        const parsed =
            parseAIJson(response.text);

        return {
            verified: Boolean(parsed.verified),
            confidence: Number(parsed.confidence || 0),
            matchScore: Number(parsed.matchScore || 0),
            locationMatch: parsed.locationMatch || "UNKNOWN",
            issueAddressed: parsed.issueAddressed || "UNKNOWN",
            summary: parsed.summary || "Verification complete.",
            concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
            provider: "gemini",
            model: modelUsed
        };

    } catch (error) {

        console.error(
            "Civic connect fix verification failed:",
            error
        );

        return {
            ...fallback,
            summary: "AI verification failed. Manual review required."
        };

    }

}
