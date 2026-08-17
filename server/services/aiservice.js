import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


/* =========================================================
   TEXT AI ANALYSIS
========================================================= */

export async function analyzeIssue({ title, description }) {
  const prompt = `
You are an AI assistant for a Civic Issue Reporting System.

Analyze this civic complaint.

Title:
"${title}"

Description:
"${description}"

Choose exactly ONE category key from:

- road = Road Damage
- garbage = Garbage / Waste
- streetlight = Broken Streetlight
- water = Water Leakage
- drainage = Drainage / Flooding
- traffic = Traffic / Signage
- other = Other

Also determine severity:
- LOW
- MEDIUM
- HIGH

Return ONLY valid JSON.

Required format:

{
  "category": "road",
  "severity": "HIGH",
  "reason": "The complaint describes a dangerous road pothole."
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text.trim();

  const result = JSON.parse(text);

  const validCategories = [
    "road",
    "garbage",
    "streetlight",
    "water",
    "drainage",
    "traffic",
    "other"
  ];

  const validSeverities = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];

  return {
    category: validCategories.includes(result.category)
      ? result.category
      : "other",

    severity: validSeverities.includes(result.severity)
      ? result.severity
      : "MEDIUM",

    reason:
      result.reason ||
      "AI analyzed the reported civic issue."
  };
}


/* =========================================================
   IMAGE AUTHENTICITY VERIFICATION
========================================================= */

export async function verifyIssueImage(
  imageBase64,
  mimeType
) {

  const prompt = `
You are an image authenticity verification system
for a Civic Issue Reporting application.

The user claims that this image was captured directly
from the real-world environment using a camera.

Your job is to determine whether the submitted image
appears to be:

1. A real-world scene captured directly by a camera
OR
2. A photo of another device/screen/monitor/phone/tablet
OR
3. A photograph of a printed photograph
OR
4. A screenshot or digitally displayed image
OR
5. An obviously reused/displayed image that does not
   appear to be a direct real-world capture.

IMPORTANT:

Look carefully for visual evidence such as:

- phone screen borders
- computer monitor borders
- tablet screens
- screen reflections
- pixels or moire patterns
- visible bezels
- UI elements
- browser windows
- image gallery interfaces
- screenshots
- printed paper edges
- photograph frames
- unnatural screen glare
- digital display artifacts

Do NOT reject a normal real-world photograph simply
because it has reflections, poor lighting, compression,
or normal camera artifacts.

A real photo taken outdoors should normally be accepted.

Return ONLY valid JSON.

Required format:

{
  "isGenuine": true,
  "confidence": 0.95,
  "reason": "The image appears to show a real-world road scene captured directly by a camera.",
  "suspiciousReason": ""
}

If the image appears to be a photo of another phone,
computer, tablet, monitor, printed photograph,
screenshot, or displayed image, return:

{
  "isGenuine": false,
  "confidence": 0.95,
  "reason": "The submitted image appears to be displayed on another device.",
  "suspiciousReason": "Visible phone screen and display artifacts."
}

The confidence must be a number between 0 and 1.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",

    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64
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

  const text = response.text.trim();

  const result = JSON.parse(text);

  return {
    isGenuine:
      result.isGenuine === true,

    confidence:
      typeof result.confidence === "number"
        ? Math.min(
            Math.max(result.confidence, 0),
            1
          )
        : 0.5,

    reason:
      result.reason ||
      "Image authenticity was analyzed.",

    suspiciousReason:
      result.suspiciousReason || ""
  };
}


/* =========================================================
   CIVIC ISSUE IMAGE ANALYSIS
========================================================= */

export async function analyzeIssueImage(
  imageBase64,
  mimeType
) {

  const prompt = `
You are an AI assistant for a Civic Issue Reporting System.

Analyze the uploaded image of a civic problem.

Detect the following:

1. title - short and clear issue title

2. category - choose exactly ONE:
   road
   garbage
   streetlight
   water
   drainage
   traffic
   other

3. department - choose the most appropriate department:
   Public Works Department
   Municipal Corporation
   Electricity Department
   Water Department
   Traffic Department
   Sanitation Department
   Other

4. description - write a clear 2-3 sentence description
   of what is visibly shown in the image.

5. severity - LOW, MEDIUM, or HIGH

6. reason - explain briefly why this severity was selected.

IMPORTANT:

Only describe things that can reasonably be identified
from the image.

Do not invent an exact location, address, person name,
or other information that cannot be seen.

Return ONLY valid JSON.

Required format:

{
  "title": "Large pothole on road",
  "category": "road",
  "department": "Public Works Department",
  "description": "A large pothole is visible on the road. It may create a safety risk for vehicles and pedestrians.",
  "severity": "HIGH",
  "reason": "The pothole appears large and can cause accidents."
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",

    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64
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

  const text = response.text.trim();

  const result = JSON.parse(text);

  const validCategories = [
    "road",
    "garbage",
    "streetlight",
    "water",
    "drainage",
    "traffic",
    "other"
  ];

  const validDepartments = [
    "Public Works Department",
    "Municipal Corporation",
    "Electricity Department",
    "Water Department",
    "Traffic Department",
    "Sanitation Department",
    "Other"
  ];

  const validSeverities = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];

  return {
    title:
      result.title ||
      "Civic Issue",

    category:
      validCategories.includes(
        result.category
      )
        ? result.category
        : "other",

    department:
      validDepartments.includes(
        result.department
      )
        ? result.department
        : "Other",

    description:
      result.description ||
      "Civic issue detected from uploaded image.",

    severity:
      validSeverities.includes(
        result.severity
      )
        ? result.severity
        : "MEDIUM",

    reason:
      result.reason ||
      "AI analyzed the uploaded image."
  };
}