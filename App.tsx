
import React, { useState, useEffect } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication, getExpandedGitaDetails } from './services/geminiService';

interface AppError {
  message: string;
  code?: string;
  category: 'API' | 'Spiritual' | 'System';
  action?: () => void;
}

const GlobalLoader: React.FC<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center transition-opacity duration-500">
      <div className="flex flex-col items-center gap-8 p-12 m3-card max-w-sm text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-3">
          <p className="text-accent font-cinzel text-2xl tracking-[0.2em] uppercase font-bold">Resonating</p>
          <p className="text-xs text-subtext uppercase tracking-widest opacity-60">Consulting Cosmic Record...</p>
        </div>
      </div>
    </div>
  );
};

const ErrorBanner: React.FC<{ error: AppError | null, onClose: () => void }> = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] max-w-xl w-full px-6">
      <div className="m3-card bg-[#2d1111]/95 border-rose-500/40 p-8 shadow-2xl animate-in">
        <div className="flex items-start gap-6">
          <span className="material-symbols-outlined text-rose-500 text-4xl">warning</span>
          <div className="flex-1">
            <h4 className="text-rose-400 font-black uppercase text-[10px] tracking-widest mb-1">{error.category} Fault</h4>
            <p className="text-white text-base font-light mb-6">{error.message}</p>
            <div className="flex gap-4">
              {error.action && (
                <button onClick={() => { error.action?.(); onClose(); }} className="bg-rose-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-colors">Retry</button>
              )}
              <button onClick={onClose} className="border border-white/10 text-white/60 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Dismiss</button>
            </div>
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
  const [fontPreference, setFontPreference] = useState<'roboto' | 'cinzel'>('roboto');
  const [errorBanner, setErrorBanner] = useState<AppError | null>(null);

  useEffect(() => {
    document.body.className = `${theme === 'gradient' ? 'gradient-bg' : 'darker-bg'} font-${fontPreference} min-h-screen`;
  }, [theme, fontPreference]);

  const handleStart = async () => {
    if (!tempProfile.name || !tempProfile.birthDate) return;
    setLoading(true);
    try {
      const plan = await generateYearlyDedication(tempProfile);
      setYearlyPlan(plan);
      setProfile(tempProfile);
    } catch (e: any) {
      setErrorBanner({ category: 'API', message: "Initialization failed. Failed to reach the spiritual node.", action: handleStart });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await generateGitaInsight(profile.name, { emotionLevel: state.emotionLevel, energyVector: state.energyVector, dimension: state.focusDimension });
      setInsight(result);
    } catch (error: any) {
      setErrorBanner({ category: 'Spiritual', message: "Wisdom synthesis interrupted.", action: fetchInsight });
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
      <div className="min-h-screen flex items-center justify-center p-8 bg-black/20">
        <GlobalLoader loading={loading} />
        <ErrorBanner error={errorBanner} onClose={() => setErrorBanner(null)} />
        <div className="m3-card max-w-md w-full p-12 text-center animate-in">
          <h1 className="font-cinzel text-5xl mb-4 text-accent tracking-tighter">Gita Alignment</h1>
          <p className="text-subtext mb-12 text-xs tracking-[0.4em] uppercase opacity-40">Predictive Matrix</p>
          <div className="space-y-6">
            <input type="text" placeholder="Full Name" className="wide-input" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} />
            <input type="date" className="wide-input" value={tempProfile.birthDate} onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })} />
            <button onClick={handleStart} className="w-full bg-accent text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all">Initialize Alignment</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1600px] mx-auto space-y-12 w-full box-border">
      <GlobalLoader loading={loading} />
      <ErrorBanner error={errorBanner} onClose={() => setErrorBanner(null)} />

      <header className="m3-card p-10 flex flex-col md:flex-row justify-between items-center gap-8 w-full">
        <div>
          <h2 className="font-cinzel text-4xl text-accent">{profile.name}'s Matrix</h2>
          <p className="text-[10px] text-subtext uppercase tracking-[0.5em] opacity-30 mt-2">V2.8.2 Active</p>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <select value={fontPreference} onChange={e => setFontPreference(e.target.value as any)} className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-accent border border-white/10 px-4 py-2 rounded-full cursor-pointer">
            <option value="roboto">Roboto</option>
            <option value="cinzel">Cinzel</option>
          </select>
          <button onClick={() => setTheme(t => t === 'gradient' ? 'darker' : 'gradient')} className="p-3 bg-white/5 rounded-full text-accent hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">{theme === 'gradient' ? 'dark_mode' : 'light_mode'}</span>
          </button>
        </div>
      </header>

      <main className="grid-24 w-full">
        {/* Left Column: 10/24 width */}
        <div className="col-span-24 lg:col-span-10 space-y-10 w-full">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Right Column: 14/24 width */}
        <div className="col-span-24 lg:col-span-14 space-y-12 w-full">
          <section className="space-y-8 w-full">
            <div className="flex justify-between items-center border-b border-white/5 pb-8 w-full">
              <h3 className="font-cinzel text-3xl text-accent">Neural Wisdom</h3>
              <button onClick={fetchInsight} disabled={loading} className="bg-accent text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Seek Insight</button>
            </div>
            {insight && (
              <div className="m3-card p-12 bg-gradient-to-br from-accent/5 to-transparent animate-in w-full">
                <p className="italic text-4xl font-cinzel text-center mb-12">"{insight.verse}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                    <p className="text-subtext text-[10px] uppercase tracking-widest mb-4">Philosophy</p>
                    <p className="text-base font-light leading-relaxed">{insight.philosophicalStatement}</p>
                  </div>
                  <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                    <p className="text-subtext text-[10px] uppercase tracking-widest mb-4">Psychology</p>
                    <p className="text-base font-light leading-relaxed">{insight.modernReframing}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-8 w-full">
            <div className="flex items-center gap-4">
              <h3 className="font-cinzel text-2xl text-accent opacity-80">Decision Nexus</h3>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <DecisionNexus state={state} onDecision={handleDecision} onUndo={handleUndo} canUndo={history.length > 0} />
          </section>

          <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center opacity-20 text-[10px] uppercase tracking-[1em] w-full">
        Grounded in Bhagavad-Gita :: 0x43F
      </footer>
    </div>
  );
};

export default App;
