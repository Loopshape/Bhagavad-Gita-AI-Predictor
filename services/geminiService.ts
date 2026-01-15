
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { GitaInsight, NeuralStep } from "../types";

// Always use named parameter for apiKey and create a new instance when needed.
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `You are a sophisticated spiritual AI sage grounded exclusively in the Bhagavad-Gita "As It Is" by A.C. Bhaktivedanta Swami Prabhupada. You act as a Neural Mesh processing unit. Blend ancient Vedic wisdom with modern systemic frameworks. Always maintain a tone of profound clarity and digital precision.`;

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Enhanced API Wrapper with detailed error handling and key selection triggers.
 */
async function apiWrapper<T>(fn: (ai: GoogleGenAI) => Promise<T>, retries = 2): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    return await fn(ai);
  } catch (error: any) {
    const errorMsg = error.message || "";
    console.error("[Gemini API Error]:", error);

    // Specific handling for missing/invalid keys as per guidelines
    if (errorMsg.includes("Requested entity was not found") || error.status === 404 || error.status === 401) {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        const retryAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await fn(retryAi);
      }
    }

    // Exponential backoff for 5xx errors
    if (retries > 0 && (error.status >= 500 || error.status === 429)) {
      const wait = (3 - retries) * 2000;
      await new Promise(r => setTimeout(r, wait));
      return apiWrapper(fn, retries - 1);
    }

    // User-friendly re-throw
    let userMessage = "The Akashic connection was interrupted.";
    if (error.status === 429) userMessage = "The Neural Mesh is overloaded. Please wait a moment.";
    if (error.status >= 500) userMessage = "The Vedic servers are temporarily unresponsive.";
    
    throw new Error(userMessage);
  }
}

export const generateNeuralGitaInsight = async (
  name: string,
  state: { emotionLevel: number; energyVector: number; dimension: string }
): Promise<{ insight: GitaInsight, steps: NeuralStep[] }> => {
  return apiWrapper(async (ai) => {
    const steps: NeuralStep[] = [
      { agent: 'Sattva-Logic', hash: generateHash(), content: "Analyzing spiritual equilibrium and sattvic alignment...", timestamp: Date.now() },
      { agent: 'Rajas-Action', hash: generateHash(), content: "Processing energy vectors and material engagement nodes...", timestamp: Date.now() },
      { agent: 'Tamas-Stability', hash: generateHash(), content: "Checking inertial resistance and grounding protocols...", timestamp: Date.now() }
    ];

    const prompt = `
      System: Neural Mesh Sync Active.
      Context: ${BASE_SYSTEM_INSTRUCTION}
      Subject: ${name}
      Matrix State: Emotional=${state.emotionLevel}, Energy=${state.energyVector}, Dimension=${state.dimension}
      
      Generate a response in JSON.
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

    const insight = JSON.parse(response.text || "{}");
    return { insight: { ...insight, neuralMeshID: generateHash() }, steps };
  });
};

export const chatWithThinkingMesh = async (query: string, dimension: string) => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: `${BASE_SYSTEM_INSTRUCTION} Dimension: ${dimension}. You are a deep-thinking mesh agent.`,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return { text: response.text, hash: generateHash() };
  });
};

export const generateProImage = async (prompt: string, size: "1K" | "2K" | "4K") => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: size } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  });
};

export const analyzeSpiritualImage = async (base64: string, mimeType: string) => {
  return apiWrapper(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image through the lens of the Bhagavad Gita. Identify the dominant Gunas (Sattva, Rajas, Tamas) and provide a spiritual reflection on its composition and meaning. Limit to 3 concise paragraphs.",
          },
        ],
      },
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  });
};

export function decode(base64: string) { return new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0))); }
export function encode(bytes: Uint8Array) { return btoa(Array.from(bytes).map(b => String.fromCharCode(b)).join("")); }
export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(numChannels, dataInt16.length / numChannels, sampleRate);
  for (let c = 0; c < numChannels; c++) {
    const channelData = buffer.getChannelData(c);
    for (let i = 0; i < channelData.length; i++) channelData[i] = dataInt16[i * numChannels + c] / 32768.0;
  }
  return buffer;
}
