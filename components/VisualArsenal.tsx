
import React, { useState, useEffect } from 'react';
import { generateProImage, analyzeSpiritualImage } from '../services/geminiService';
import { ArchivedAnalysis } from '../types';
import { soundService } from '../services/soundService';

const VisualArsenal: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [archive, setArchive] = useState<ArchivedAnalysis[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gita_visual_archive');
    if (saved) setArchive(JSON.parse(saved));
  }, []);

  const saveToArchive = () => {
    if (!analysis || !uploadPreview) return;
    const newItem: ArchivedAnalysis = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      imageUrl: uploadPreview,
      analysis: analysis
    };
    const newArchive = [newItem, ...archive].slice(0, 10);
    setArchive(newArchive);
    localStorage.setItem('gita_visual_archive', JSON.stringify(newArchive));
    soundService.playBell(550, 0.4);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setImgUrl(null);
    try {
      const url = await generateProImage(prompt, size);
      setImgUrl(url);
      soundService.playBell(880, 0.2);
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setAnalysis(null);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadPreview(base64Data);
      
      const base64 = base64Data.split(',')[1];
      try {
        const result = await analyzeSpiritualImage(base64, file.type);
        setAnalysis(result);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadGenerated = () => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `gita-manifestation-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-cinzel text-[#ffcc00] mb-4 uppercase tracking-widest text-sm">Visual Manifestation</h3>
        <div className="space-y-4">
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe a spiritual scene (e.g., Krishna in a digital landscape)..."
            className="w-full !bg-white/5 border !border-white/10 rounded-xl p-3 text-xs h-20 focus:outline-none"
          />
          <div className="flex justify-between items-center gap-2">
            <select 
              value={size} 
              onChange={e => setSize(e.target.value as any)}
              className="!bg-white/5 border !border-white/10 rounded-lg text-[10px] p-1 h-10 px-3"
            >
              <option value="1K">1K Res</option>
              <option value="2K">2K Res</option>
              <option value="4K">4K Res</option>
            </select>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#ffcc00] text-black text-[10px] font-black px-6 h-10 rounded-xl uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Manifest'}
            </button>
          </div>
          {imgUrl && (
            <div className="relative group mt-4">
              <img src={imgUrl} className="rounded-xl border border-white/10 w-full shadow-2xl" />
              <button 
                onClick={downloadGenerated}
                className="absolute top-2 right-2 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download"
              >
                <span className="material-symbols-outlined text-white text-sm">download</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="font-cinzel text-[#00f2ff] mb-4 uppercase tracking-widest text-sm">Vedic Image Analysis</h3>
        <div className="space-y-4">
          <div className="relative">
             <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload}
              className="text-[10px] w-full file:bg-white/5 file:border-white/10 file:text-white/60 file:rounded-lg file:px-3 file:py-2 file:mr-4 hover:file:bg-white/10 transition-all"
            />
          </div>
          
          {uploadPreview && (
            <div className="mt-2 relative h-32 w-full overflow-hidden rounded-xl border border-white/10">
              <img src={uploadPreview} className="w-full h-full object-cover opacity-50" />
              {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="w-4 h-4 border-2 border-[#00f2ff] border-t-transparent animate-spin rounded-full"></div></div>}
            </div>
          )}

          {analysis && (
            <div className="space-y-4 layer-transition">
              <div className="p-4 bg-white/5 rounded-xl text-[11px] italic leading-relaxed text-white/70 border border-white/5">
                {analysis}
              </div>
              <button 
                onClick={saveToArchive}
                className="w-full bg-white/5 border border-white/10 text-white/60 text-[10px] py-2 rounded-lg hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Save to Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {archive.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl">
           <h3 className="font-cinzel text-white/40 mb-4 uppercase tracking-widest text-[10px]">Archived Scans</h3>
           <div className="space-y-3">
              {archive.map(item => (
                <div key={item.id} className="flex gap-3 items-center p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <img src={item.imageUrl} className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/80 truncate">{item.analysis.substring(0, 40)}...</p>
                    <p className="text-[8px] text-white/20">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default VisualArsenal;
