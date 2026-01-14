
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { GitaInsight, YearlyDedication } from "../types";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGitaInsight = async (
  name: string,
  state: { emotionLevel: number; energyVector: number; dimension: string }
): Promise<GitaInsight> => {
  const ai = getAI();
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
  const ai = getAI();
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

export const searchGitaWisdom = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter((web: any) => !!web) || [];
    
  return { text: response.text, sources };
};

export const chatWithThinking = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text;
};

export const generateProImage = async (prompt: string, size: "1K" | "2K" | "4K") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: size }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const analyzeSpiritualImage = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this image's spiritual and psychological alignment. Does it represent Sattva, Rajas, or Tamas?" }
      ]
    }
  });
  return response.text;
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
        { text: "Transcribe this audio exactly." }
      ]
    }
  });
  return response.text;
};

export const generateSpeech = async (text: string) => {
  const ai = getAI();
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
