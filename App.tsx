
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, AlignmentState, GitaInsight, NeuralStep } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import AkashicBackground from './components/AkashicBackground';
import NeuralLoader from './components/NeuralLoader';
import LiveConversation from './components/LiveConversation';
import VisualArsenal from './components/VisualArsenal';
import { generateNeuralGitaInsight } from './services/geminiService';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: '', birthDate: '' });
  const [state, setState] = useState<AlignmentState>({ emotionLevel: 0, energyVector: 50, focusDimension: 'Material' });
  const [insight, setInsight] = useState<GitaInsight | null>(null);
  const [steps, setSteps] = useState<NeuralStep[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    soundService.playTransition();
  }, []);

  const handleStart = () => {
    if (!tempProfile.name) return;
    setLoading(true);
    setTimeout(() => {
      setProfile(tempProfile);
      setLoading(false);
      soundService.playTransition();
    }, 2000);
  };

  const fetchInsight = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { insight: result, steps: neuralSteps } = await generateNeuralGitaInsight(profile.name, { 
        emotionLevel: state.emotionLevel, 
        energyVector: state.energyVector, 
        dimension: state.focusDimension 
      });
      setInsight(result);
      setSteps(neuralSteps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [profile, state]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 relative z-50">
        <AkashicBackground />
        <div className="glass-panel p-16 max-w-2xl w-full text-center layer-transition">
          <h1 className="text-7xl font-cinzel font-black tracking-tighter text-[#ff00ff] mb-4">GITA MATRIX</h1>
          <p className="text-[10px] font-code tracking-[1em] text-white/30 uppercase mb-16 italic">Neural Alignment Node v3.0</p>
          <div className="space-y-8 text-left">
            <div>
                <label className="text-[9px] font-code uppercase tracking-widest text-white/40 block mb-3 ml-2">Identity Node</label>
                <input type="text" placeholder="Designation" className="w-full" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} />
            </div>
            <div>
                <label className="text-[9px] font-code uppercase tracking-widest text-white/40 block mb-3 ml-2">Temporal Pivot</label>
                <input type="date" className="w-full" value={tempProfile.birthDate} onChange={e => setTempProfile({...tempProfile, birthDate: e.target.value})} />
            </div>
            <button onClick={handleStart} className="w-full bg-[#ff00ff] text-black font-black py-6 rounded-xl hover:scale-105 transition-all text-sm uppercase tracking-widest mt-10 shadow-[0_0_30px_rgba(255,0,255,0.3)]">Initiate Mesh</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container relative z-10">
      <AkashicBackground />
      <NeuralLoader loading={loading} />

      {/* HEADER */}
      <header className="grid-area-header glass-panel px-10 py-6 flex justify-between items-center col-span-2">
        <div className="flex items-center gap-8">
          <div className="w-10 h-10 rounded-full border border-[#ff00ff] flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-sm text-[#ff00ff]">hub</span>
          </div>
          <div>
            <h2 className="text-xl font-cinzel tracking-widest text-white leading-none uppercase">{profile.name} // NODE_SYNC</h2>
            <p className="text-[9px] font-code text-white/30 mt-2 uppercase">Entropy: {Math.random().toFixed(4)} :: Hash: 0x43F9...</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
             <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex gap-4 text-[10px] font-code">
                <span className="text-[#00f2ff]">CPU: 12%</span>
                <span className="text-[#ff00ff]">MEM: 512MB</span>
             </div>
             <button onClick={() => setProfile(null)} className="p-3 hover:bg-white/5 rounded-full transition-all">
                <span className="material-symbols-outlined text-white/30 hover:text-[#ff3e3e]">logout</span>
             </button>
        </div>
      </header>

      {/* LEFT COLUMN */}
      <aside className="grid-area-left flex flex-col gap-6 overflow-hidden">
        <MentalShapeMatrix state={state} onChange={setState} />
        <DecisionNexus state={state} onDecision={impact => setState(s => ({...s, ...impact}))} />
        <VisualArsenal />
      </aside>

      {/* MAIN RIGHT COLUMN */}
      <main className="grid-area-right flex flex-col gap-6 min-h-0">
        <div className="glass-panel p-10 flex flex-col gap-8 flex-1 min-h-0">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="font-cinzel text-2xl tracking-widest text-[#ffcc00] uppercase">Neural Wisdom Output</h3>
                <button onClick={fetchInsight} className="px-8 py-3 bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all">Seek Mesh Logic</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 space-y-10 custom-scroll">
                {insight ? (
                    <div className="space-y-10 layer-transition">
                        <div className="bg-black/40 p-12 rounded-3xl border border-[#ffcc00]/10 text-center relative">
                            <span className="absolute top-4 left-6 text-[8px] font-code text-[#ffcc00]/30">MESH_REF: {insight.neuralMeshID}</span>
                            <p className="font-cinzel text-4xl italic text-white/90 leading-relaxed">"{insight.verse}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white/5 rounded-2xl border border-white/5 hover:border-[#00f2ff]/20 transition-all">
                                <h6 className="text-[10px] font-code text-[#00f2ff] uppercase tracking-widest mb-4">Vedic Core</h6>
                                <p className="text-lg font-light leading-relaxed text-white/70">{insight.philosophicalStatement}</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-2xl border border-white/5 hover:border-[#ff00ff]/20 transition-all">
                                <h6 className="text-[10px] font-code text-[#ff00ff] uppercase tracking-widest mb-4">Digital Realignment</h6>
                                <p className="text-lg font-light leading-relaxed text-white/70">{insight.modernReframing}</p>
                            </div>
                        </div>
                        {steps.length > 0 && (
                            <div className="pt-8 border-t border-white/5">
                                <p className="text-[10px] font-code text-white/20 uppercase tracking-[0.5em] mb-6">Parallel Reasoning Streams</p>
                                <div className="space-y-4">
                                    {steps.map((s, i) => (
                                        <div key={i} className="flex gap-4 items-center p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                            <span className="text-[9px] font-code text-[#ffcc00] w-24 shrink-0">{s.agent}</span>
                                            <span className="text-[9px] font-code text-white/30 truncate flex-1">{s.hash}</span>
                                            <span className="text-[11px] text-white/60 italic">{s.content}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 gap-8 py-24">
                        <span className="material-symbols-outlined text-[10rem]">auto_stories</span>
                        <p className="font-code uppercase tracking-[1em] text-xl">Awaiting Synchronization</p>
                    </div>
                )}
            </div>
        </div>
        
        <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
      </main>

      {/* FOOTER */}
      <footer className="grid-area-footer glass-panel px-10 py-4 flex justify-between items-center col-span-2 text-[9px] font-code text-white/20 uppercase tracking-[0.5em]">
        <div>Neural_Mesh_Manifest :: SHA256_VERIFIED</div>
        <div className="flex gap-10">
            <span>Lat: {Math.random().toFixed(4)}</span>
            <span>Lng: {Math.random().toFixed(4)}</span>
            <span className="text-[#ff00ff]">0x43F_ONLINE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
