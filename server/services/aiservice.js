import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    })
    : null;

export async function analyzeIssue({ title, description }) {

    if (!ai) {
        return {
            category: "other",
            severity: "MEDIUM",
            confidence: 0,
            reason: "Gemini API key not configured.",
            provider: "fallback"
        };
    }

    const prompt = `
You are a civic issue classification system.

Analyze this citizen complaint.

Title:
${title}

Description:
${description}

Return ONLY JSON:

{
  "category": "road|garbage|streetlight|water|drainage|electricity|traffic|public_safety|other",
  "severity": "LOW|MEDIUM|HIGH|URGENT",
  "confidence": 0.0,
  "department": "string",
  "reason": "string"
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    return JSON.parse(response.text);
}
