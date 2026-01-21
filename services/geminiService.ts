
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiRepoAnalysis, Repository } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeRepository(
  repoUrl: string, 
  userNotes: string = ""
): Promise<GeminiRepoAnalysis> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this GitHub repository: ${repoUrl}. User notes: ${userNotes}. 
    Provide a professional summary, common use cases, estimated difficulty to explore/setup, and metadata.
    Estimate the star count based on your knowledge of this project.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
          difficulty: { type: Type.STRING },
          primaryLanguage: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedStars: { type: Type.NUMBER }
        },
        required: ["summary", "useCases", "difficulty", "primaryLanguage", "topics", "estimatedStars"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as GeminiRepoAnalysis;
}

export async function getSmartRecommendation(
  repos: Repository[],
  userVibe: string
): Promise<{ repoId: string; reason: string }> {
  const repoContext = repos.map(r => ({
    id: r.id,
    name: r.name,
    summary: r.aiSummary,
    difficulty: r.difficulty,
    useCases: r.useCases
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this user's repository vault: ${JSON.stringify(repoContext)}.
    The user says: "${userVibe}".
    Pick the best ONE repository for them to try out right now and give a very short, encouraging reason why.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          repoId: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["repoId", "reason"]
      }
    }
  });

  return JSON.parse(response.text.trim());
}
