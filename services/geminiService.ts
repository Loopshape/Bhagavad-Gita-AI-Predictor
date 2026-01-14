
import { GoogleGenAI, Type } from "@google/genai";
import { GitaInsight, YearlyDedication } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGitaInsight = async (
  name: string,
  state: { emotionLevel: number; energyVector: number; dimension: string }
): Promise<GitaInsight> => {
  const prompt = `
    Context: You are a sophisticated spiritual AI sage based on the Bhagavad-Gita "As It Is" (Prabhupada Edition).
    User: ${name}
    Current Mental Shape:
    - Emotional Valence: ${state.emotionLevel} (-100 to 100)
    - Energy Level: ${state.energyVector} (0 to 100)
    - Primary Focus Dimension: ${state.dimension}
    
    Task:
    1. Generate a modern "Gita Verse" structure.
    2. Provide a philosophical statement with deeper insight.
    3. Summarize it in a short, powerful text.
    4. Provide a "Modern Psychological Reframing" that aligns the Gita's teachings with current digital/social habits.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.STRING },
          summary: { type: Type.STRING },
          philosophicalStatement: { type: Type.STRING },
          modernReframing: { type: Type.STRING },
        },
        required: ["verse", "summary", "philosophicalStatement", "modernReframing"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateYearlyDedication = async (profile: { name: string, birthDate: string }): Promise<YearlyDedication> => {
  const prompt = `
    Generate a "Yearly Dedication Workflow" inspired by the Bhagavad Gita for:
    Name: ${profile.name}
    Birth Date: ${profile.birthDate}
    
    Blend ancient Vedic wisdom (Sattva, Rajas, Tamas) with modern psychological framing.
    The response must be a structured plan for the upcoming 12 months.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: { type: Type.STRING },
          coreSpiritualLesson: { type: Type.STRING },
          quarters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quarter: { type: Type.STRING },
                theme: { type: Type.STRING },
                gitaVerse: { type: Type.STRING },
                balancingAction: { type: Type.STRING }
              },
              required: ["quarter", "theme", "gitaVerse", "balancingAction"]
            }
          }
        },
        required: ["introduction", "coreSpiritualLesson", "quarters"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
