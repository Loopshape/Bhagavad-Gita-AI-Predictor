import React, { useState, useEffect } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication } from './services/geminiService';

interface AppError {
  message: string;
  category: 'API' | 'Spiritual' | 'System';
  action?: () => void;
}

const GlobalLoader: React.FC<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-24 h-24 border-4 border-neon-magenta border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-neon-magenta text-4xl font-cinzel tracking-widest uppercase">Resonating Matrix</h2>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{ error: AppError | null, onClose: () => void }> = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] max-w-2xl w-full px-4 animate-in">
      <div className="bg-[#2d0a0a] border-2 border-neon-red p-8 rounded-[2rem] shadow-[0_0_30px_rgba(255,0,0,0.3)] flex items-start gap-6">
        <span className="material-symbols-outlined text-neon-red text-5xl">report_problem</span>
        <div className="flex-1">
          <h4 className="text-neon-red font-cinzel mb-2 uppercase tracking-widest">{error.category} FAULT</h4>
          <p className="text-white text-lg font-light mb-6 opacity-80">{error.message}</p>
          <div className="flex gap-4">
            {error.action && (
              <button 
                onClick={() => { error.action?.(); onClose(); }} 
                className="bg-neon-red text-black font-black px-6 py-2 rounded-xl text-xs uppercase hover:scale-105 active:scale-95 transition-all"
              >
                Retry Alignment
              </button>
            )}
            <button onClick={onClose} className="border border-white/20 text-white/50 px-6 py-2 rounded-xl text-xs uppercase hover:bg-white/5 transition-all">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: '', birthDate: '' });
  const [state, setState] = useState<AlignmentState>({ emotionLevel: 0, energyVector: 50, focusDimension: 'Material' });
  const [history, setHistory] = useState<AlignmentState[]>([]);
  const [insight, setInsight] = useState<GitaInsight | null>(null);
  const [yearlyPlan, setYearlyPlan] = useState<YearlyDedication | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'gradient' | 'darker'>('gradient');
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    document.body.className = theme === 'gradient' ? 'gradient-bg' : 'darker-bg';
  }, [theme]);

  const handleStart = async () => {
    if (!tempProfile.name || !tempProfile.birthDate) return;
    setLoading(true);
    try {
      const plan = await generateYearlyDedication(tempProfile);
      setYearlyPlan(plan);
      setProfile(tempProfile);
    } catch (e: any) {
      setError({ category: 'API', message: "Initialization failure. The neural bridge could not establish connection.", action: handleStart });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await generateGitaInsight(profile.name, { 
        emotionLevel: state.emotionLevel, 
        energyVector: state.energyVector, 
        dimension: state.focusDimension 
      });
      setInsight(result);
    } catch (e) {
      setError({ category: 'Spiritual', message: "Wisdom synthesis interrupted by systemic noise.", action: fetchInsight });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (impact: Partial<AlignmentState>) => {
    setHistory(prev => [...prev, { ...state }]);
    setState(prev => ({
      ...prev,
      emotionLevel: Math.max(-100, Math.min(100, prev.emotionLevel + (impact.emotionLevel || 0))),
      energyVector: Math.max(0, Math.min(100, prev.energyVector + (impact.energyVector || 0)))
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setState(last);
    setHistory(prev => prev.slice(0, -1));
  };

  if (!profile) {
    return (
      <div className="grid-container flex items-center justify-center h-screen">
        <GlobalLoader loading={loading} />
        <ErrorDisplay error={error} onClose={() => setError(null)} />
        <div className="content-narrow bg-black/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 shadow-2xl animate-in text-center">
          <h1 className="font-cinzel text-neon-red mb-8">Gita Matrix</h1>
          <p className="mb-12 text-neon-white opacity-60 uppercase tracking-[0.5em] text-xs font-black">Spiritual Predictor v2.8.2</p>
          <div className="space-y-8 text-left">
            <input type="text" placeholder="Identity Name" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} />
            <input type="date" value={tempProfile.birthDate} onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })} />
            <button onClick={handleStart} className="w-full bg-neon-magenta text-black font-black py-6 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)] uppercase tracking-widest text-lg">Initiate Alignment</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-container animate-in">
      <GlobalLoader loading={loading} />
      <ErrorDisplay error={error} onClose={() => setError(null)} />

      {/* HEADER */}
      <header className="full-bleed flex justify-between items-center mb-12 py-8 border-b border-white/5">
        <div>
          <h2 className="text-neon-green font-cinzel uppercase tracking-tighter m-0 border-none p-0">{profile.name}'s Matrix</h2>
          <p className="text-neon-magenta text-xs font-black uppercase tracking-[0.4em] mt-2 opacity-50">Resonance Layer: {state.focusDimension}</p>
        </div>
        <button 
          onClick={() => setTheme(t => t === 'gradient' ? 'darker' : 'gradient')} 
          className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full hover:bg-white/10 transition-all group"
        >
          <span className="material-symbols-outlined text-neon-yellow group-hover:rotate-90 transition-transform">
            {theme === 'gradient' ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="text-xs uppercase font-black tracking-widest text-white/70">Theme Cycle</span>
        </button>
      </header>

      {/* LEFT COLUMN: Controls & Visualization */}
      <aside className="col-span-24 lg:col-span-10 space-y-12">
        <MentalShapeMatrix state={state} onChange={setState} />
        <LiveConversation />
        <VisualArsenal />
      </aside>

      {/* RIGHT COLUMN: Synthesis & Logic */}
      <main className="col-span-24 lg:col-span-14 space-y-12">
        <section className="bg-black/20 p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
            <h3 className="text-neon-blue m-0">Neural Wisdom</h3>
            <button onClick={fetchInsight} disabled={loading} className="bg-neon-blue text-black px-12 py-3 rounded-full font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,150,255,0.4)]">Seek Insight</button>
          </div>
          
          {insight ? (
            <div className="animate-in space-y-12">
              <div className="bg-gradient-to-br from-neon-blue/10 to-transparent p-12 rounded-[2.5rem] border border-neon-blue/20">
                <p className="font-cinzel text-5xl text-center leading-tight text-white shadow-sm italic">"{insight.verse}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 p-10 rounded-[2rem] border border-white/5 hover:border-neon-blue/30 transition-colors group">
                  <h6 className="text-neon-blue opacity-40 uppercase tracking-widest mb-4 group-hover:opacity-100 transition-opacity">Systemic Depth</h6>
                  <p className="text-xl font-light leading-relaxed">{insight.philosophicalStatement}</p>
                </div>
                <div className="bg-black/40 p-10 rounded-[2rem] border border-white/5 hover:border-neon-magenta/30 transition-colors group">
                  <h6 className="text-neon-magenta opacity-40 uppercase tracking-widest mb-4 group-hover:opacity-100 transition-opacity">Mapping Protocol</h6>
                  <p className="text-xl font-light leading-relaxed">{insight.modernReframing}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center opacity-10">
              <span className="material-symbols-outlined text-9xl mb-4">auto_stories</span>
              <p className="uppercase tracking-[0.5em] font-black italic">Awaiting Focal Input</p>
            </div>
          )}
        </section>

        <section className="bg-black/20 p-12 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6 mb-12">
            <h4 className="text-neon-yellow m-0">Decision Nexus</h4>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          <DecisionNexus state={state} onDecision={handleDecision} onUndo={handleUndo} canUndo={history.length > 0} />
        </section>

        <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
      </main>

      <footer className="full-bleed py-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 text-[10px] uppercase tracking-[1em] font-black mt-24">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-neon-magenta">verified_user</span>
          Neural Alignment Engine v2.8.2
        </div>
        <div className="italic text-neon-blue">Prabhupada Framework Protocol 0x43F</div>
      </footer>
    </div>
  );
};

export default App;