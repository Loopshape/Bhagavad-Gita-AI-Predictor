import { NeuralStep } from "../types";

const OLLAMA_ENDPOINT = "/api/generate";
const MODEL = "llama3"; 

export interface LocalAIResponse {
  text: string;
  steps: NeuralStep[];
}

export const localAiService = {
  isConnected: async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/tags");
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  chat: async (prompt: string, context: string): Promise<LocalAIResponse> => {
    try {
        const response = await fetch(OLLAMA_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL,
                prompt: `Context: ${context}\n\nUser: ${prompt}\n\nAssistant:`,
                stream: false
            })
        });

        if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Local AI Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.response;

        // Simulate neural steps since local model might not output structured steps
        const steps: NeuralStep[] = [
            { agent: 'Sattva-Logic', hash: 'LOC_' + Date.now(), content: 'Local inferencing complete.', timestamp: Date.now() },
            { agent: 'Rajas-Action', hash: 'LOC_EXE', content: 'Bridge pipeline active.', timestamp: Date.now() }
        ];

        return { text, steps };
    } catch (e) {
        console.error("Local AI failed", e);
        throw e;
    }
  }
};
