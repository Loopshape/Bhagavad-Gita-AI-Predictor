
import React, { useState } from 'react';
import { generateProImage, analyzeSpiritualImage } from '../services/geminiService';

const VisualArsenal: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey) return;
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed assuming key selected per race condition guidance
    }

    setLoading(true);
    setImgUrl(null);
    try {
      const url = await generateProImage(prompt, size);
      setImgUrl(url);
    } catch (e) {
      console.error(e);
      if (e.message?.includes("entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeSpiritualImage(base64, file.type);
      setAnalysis(result);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl">
        <h3 className="font-cinzel text-accent mb-4">Nano Banana Visualization</h3>
        <div className="space-y-3">
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe a spiritual scene (e.g., Kurukshetra sunset)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs h-20 focus:outline-none"
          />
          <div className="flex justify-between items-center">
            <select 
              value={size} 
              onChange={e => setSize(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg text-[10px] p-1"
            >
              <option value="1K">1K Res</option>
              <option value="2K">2K Res</option>
              <option value="4K">4K Res</option>
            </select>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-black text-xs font-bold px-4 py-2 rounded-xl"
            >
              {loading ? 'Manifesting...' : 'Generate Pro'}
            </button>
          </div>
          {imgUrl && <img src={imgUrl} className="mt-4 rounded-xl border border-white/10 w-full shadow-2xl" />}
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h3 className="font-cinzel text-accent mb-4">Guna Image Analysis</h3>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload}
          className="text-[10px] file:bg-white/5 file:border-white/10 file:text-subtext file:rounded-lg file:px-3 file:py-1 file:mr-4"
        />
        {analysis && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl text-xs italic leading-relaxed text-subtext border border-white/5">
            {analysis}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualArsenal;
