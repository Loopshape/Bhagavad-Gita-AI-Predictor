
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { GitaInsight, YearlyDedication } from "../types";

/**
 * Creates a fresh instance of GoogleGenAI using the latest API key from environment/context.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `You are a sophisticated spiritual AI sage grounded exclusively in the Bhagavad-Gita "As It Is" by A.C. Bhaktivedanta Swami Prabhupada (https://www.prabhupada-books.de/pdf/Bhagavad-gita-As-It-Is.pdf). Your task is to blend ancient Vedic wisdom with modern systemic frameworks, digital structures, and mental health prognosis. Always maintain a tone of profound clarity, compassion, and uncompromising truth.`;

/**
 * Robust wrapper for API calls to handle 500 errors (retry) and 
 * 403/Requested entity not found errors (prompt for key selection).
 */
async function apiWrapper<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 2): Promise<T> {
  const ai = getAI();
  try {
    return await fn(ai);
  } catch (error: any) {
    const errorMsg = error.message || "";
    const isPermissionError = errorMsg.includes("Requested entity was not found") || 
                              errorMsg.includes("PERMISSION_DENIED") || 
                              error.status === 403 || 
                              error.code === 403;

    if (isPermissionError && window.aistudio?.openSelectKey) {
      console.warn("Permission denied or entity not found. Prompting for API key selection...");
      await window.aistudio.openSelectKey();
      // Retry once after key selection
      const newAi = getAI();
      return await fn(newAi);
    }

    if (retries > 0 && (error.status >= 500 || error.code >= 500)) {
      console.warn(`Internal error (500). Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return apiWrapper(fn, retries - 1);
    }

    throw error;
  }
}

export const generateGitaInsight = async (
  name: string,
  state: { emotionLevel: number; energyVector: number; dimension: string }
): Promise<GitaInsight> => {
  return apiWrapper(async (ai) => {
    const prompt = `
      Context: ${BASE_SYSTEM_INSTRUCTION}
      User: ${name}
      Current Mental Shape:
      - Emotional Valence: ${state.emotionLevel} (-100 to 100)
      - Energy Level: ${state.energyVector} (0 to 100)
      - Primary Focus Dimension: ${state.dimension}
      
      Task:
      1. Generate a modern "Gita Verse" structure inspired by the Prabhupada translation.
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
  });
};

export const generateReflectionPrompt = async (dimension: string, emotionLevel: number): Promise<string> => {
  return apiWrapper(async (ai) => {
    const prompt = `Based on the Bhagavad-Gita "As It Is" by Prabhupada, generate a profound self-reflection prompt for someone focusing on the ${dimension} dimension with an emotional valence of ${emotionLevel} (-100 to 100). Return ONLY the prompt text.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Reflect on your current path and its alignment with your inner truth.";
  });
};

export const getExpandedGitaDetails = async (verse: string, balancingAction: string): Promise<string> => {
  return apiWrapper(async (ai) => {
    const prompt = `Deeply expand on this Gita wisdom from Prabhupada's "As It Is": "${verse}" and its practical application: "${balancingAction}". Focus on spiritual and psychological resonance. Use 100-150 words.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "No further details available at this moment.";
  });
};

export const generateYearlyDedication = async (profile: { name: string, birthDate: string }): Promise<YearlyDedication> => {
  return apiWrapper(async (ai) => {
    const prompt = `
      Context: ${BASE_SYSTEM_INSTRUCTION}
      Generate a "Yearly Dedication Workflow" inspired by the Bhagavad Gita for:
      Name: ${profile.name}
      Birth Date: ${profile.birthDate}
      
      Blend ancient Vedic wisdom (Sattva, Rajas, Tamas) from Prabhupada's commentary with modern psychological framing.
      Provide a structured plan for 12 months.
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
  });
};

export const searchGitaWisdom = async (query: string) => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: BASE_SYSTEM_INSTRUCTION
      },
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => !!web) || [];
      
    return { text: response.text, sources };
  });
};

export const chatWithThinking = async (query: string, concise: boolean = false) => {
  return apiWrapper(async (ai) => {
    const systemInstruction = concise 
      ? `${BASE_SYSTEM_INSTRUCTION} You are a concise spiritual sage. Provide short, direct, and impactful answers.`
      : `${BASE_SYSTEM_INSTRUCTION} You are a deep-thinking spiritual sage. Provide detailed philosophical insights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: concise ? 0 : 32768 }
      },
    });
    return response.text;
  });
};

export const generateProImage = async (prompt: string, size: "1K" | "2K" | "4K") => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1", imageSize: size }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};

export const analyzeSpiritualImage = async (base64Data: string, mimeType: string) => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyze this image's spiritual and psychological alignment according to Bhagavad-Gita Guna philosophy (Sattva, Rajas, Tamas)." }
        ]
      }
    });
    return response.text;
  });
};

export const generateSpeech = async (text: string) => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
