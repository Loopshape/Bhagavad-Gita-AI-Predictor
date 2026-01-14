import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication, QuarterlyFocus } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication, getExpandedGitaDetails } from './services/geminiService';

interface AppError {
  message: string;
  category: 'Spiritual' | 'Connection' | 'Computational' | 'Identity';
  code: string;
  steps: string[];
  action?: () => void;
}

const GlobalLoader: React.FC<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center transition-opacity duration-500">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="absolute inset-0 border-4 border-neon-magenta border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-neon-blue border-b-transparent rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-neon-yellow text-5xl animate-pulse">psychology</span>
          </div>
        </div>
        <h2 className="text-neon-magenta text-4xl font-cinzel tracking-[0.3em] uppercase mb-2">Aligning</h2>
        <p className="text-neon-blue text-xs font-black uppercase tracking-[0.6em] opacity-60">Consulting Cosmic Matrix Protocol...</p>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const ErrorBanner: React.FC<{ error: AppError | null, onClose: () => void }> = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[400] max-w-2xl w-full px-4 animate-in">
      <div className="bg-[#2a0a1a] border-2 border-neon-red p-10 rounded-[3rem] shadow-[0_0_50px_rgba(255,0,0,0.4)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-neon-red animate-pulse"></div>
        <div className="flex items-start gap-8">
          <div className="bg-neon-red/10 p-4 rounded-2xl border border-neon-red/30">
            <span className="material-symbols-outlined text-neon-red text-6xl">warning_amber</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-neon-red font-cinzel text-2xl uppercase tracking-widest">{error.category} FAULT</h4>
                <p className="text-neon-red text-[10px] font-black tracking-widest opacity-60">ERROR CODE: {error.code}</p>
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-neon-red transition-colors">
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
            </div>
            
            <p className="text-white text-xl font-light mb-8 leading-relaxed italic">"{error.message}"</p>
            
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
              <h5 className="text-neon-yellow text-[10px] font-black uppercase tracking-widest mb-4">Resolution Steps</h5>
              <ul className="space-y-3">
                {error.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="text-neon-blue font-black">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              {error.action && (
                <button 
                  onClick={() => { error.action?.(); onClose(); }} 
                  className="flex-1 bg-neon-red text-black font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                  Retry Operation
                </button>
              )}
              <button onClick={onClose} className="px-8 py-4 border border-white/10 text-white/50 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DecisionHistoryChart: React.FC<{ history: AlignmentState[] }> = ({ history }) => {
  if (history.length === 0) return null;
  const recentHistory = history.slice(-10);
  return (
    <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 shadow-xl mb-8 animate-in">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] uppercase font-black tracking-widest text-neon-magenta">Impact Sequence</h5>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-neon-green rounded-full"></div><span className="text-[8px] uppercase tracking-widest text-white/40">Emotion</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-neon-blue rounded-full"></div><span className="text-[8px] uppercase tracking-widest text-white/40">Energy</span></div>
        </div>
      </div>
      <div className="flex items-end gap-2 h-24 w-full px-2">
        {recentHistory.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1">
            <div className="w-full bg-neon-green/40 rounded-t-sm" style={{ height: `${Math.abs(s.emotionLevel + 100) / 2}%` }}></div>
            <div className="w-full bg-neon-blue/40 rounded-t-sm" style={{ height: `${s.energyVector}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuarterlyCard: React.FC<{ focus: QuarterlyFocus }> = ({ focus }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && !details) {
      setLoadingDetails(true);
      try {
        const d = await getExpandedGitaDetails(focus.gitaVerse, focus.balancingAction);
        setDetails(d);
      } catch (e) {
        setDetails("Details currently unavailable in the cosmic record.");
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div 
      onClick={toggleExpand}
      className={`bg-black/40 border border-white/10 rounded-[2.5rem] p-8 transition-all cursor-pointer hover:bg-black/60 group ${expanded ? 'col-span-2' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h6 className="text-neon-green font-black uppercase text-[10px] tracking-widest">{focus.quarter}</h6>
        <span className="material-symbols-outlined text-neon-magenta text-xl group-hover:rotate-180 transition-transform">
          {expanded ? 'keyboard_arrow_up' : 'expand_more'}
        </span>
      </div>
      <h5 className="font-cinzel text-white text-xl mb-4 group-hover:text-accent">{focus.theme}</h5>
      <p className="text-slate-400 text-sm italic mb-4 leading-relaxed">"{focus.gitaVerse}"</p>
      <div className="flex items-center gap-3">
        <span className="text-[8px] uppercase font-black tracking-widest text-neon-blue">Action:</span>
        <span className="text-xs text-neon-blue font-bold">{focus.balancingAction}</span>
      </div>
      {expanded && (
        <div className="mt-8 pt-8 border-t border-white/5 animate-in">
          {loadingDetails ? (
            <div className="flex gap-2 p-2"><div className="w-1 h-1 bg-accent rounded-full animate-bounce"></div><div className="w-1 h-1 bg-accent rounded-full animate-bounce delay-150"></div></div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-200 bg-white/5 p-6 rounded-2xl italic">{details}</p>
          )}
        </div>
      )}
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
  const [fontPref, setFontPref] = useState<'roboto' | 'cinzel'>('cinzel');
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    document.body.className = `${theme === 'gradient' ? 'gradient-bg' : 'darker-bg'} font-${fontPref}`;
  }, [theme, fontPref]);

  const handleStart = useCallback(async () => {
    if (!tempProfile.name || !tempProfile.birthDate) {
      setError({
        category: 'Identity',
        code: 'IDENT-001',
        message: 'Identity credentials incomplete.',
        steps: ['Populate your identity name.', 'Verify your temporal root (birth date).'],
      });
      return;
    }
    setLoading(true);
    try {
      const plan = await generateYearlyDedication(tempProfile);
      setYearlyPlan(plan);
      setProfile(tempProfile);
    } catch (e: any) {
      setError({ 
        category: 'Computational', 
        code: 'COMP-503', 
        message: "Initialization failure. The roadmap node is currently unstable.", 
        steps: ['Check network stability.', 'Try re-initiating the alignment protocol.'],
        action: handleStart 
      });
    } finally {
      setLoading(false);
    }
  }, [tempProfile]);

  const fetchInsight = useCallback(async () => {
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
      setError({ 
        category: 'Spiritual', 
        code: 'SPIR-808', 
        message: "Wisdom synthesis resonance interrupted.", 
        steps: ['Re-sync the mental matrix.', 'Try the seek protocol again.'],
        action: fetchInsight 
      });
    } finally {
      setLoading(false);
    }
  }, [profile, state]);

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
        <ErrorBanner error={error} onClose={() => setError(null)} />
        <div className="col-span-12 col-start-7 bg-black/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 shadow-2xl animate-in text-center">
          <h1 className="font-cinzel text-neon-red mb-8 text-6xl">Gita Matrix</h1>
          <div className="space-y-8 text-left">
            <input type="text" placeholder="Identity Name" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} />
            <input type="date" value={tempProfile.birthDate} onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })} />
            <button onClick={handleStart} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg bg-neon-magenta/20 hover:bg-neon-magenta/40 text-white">Initiate Alignment</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-container animate-in">
      <GlobalLoader loading={loading} />
      <ErrorBanner error={error} onClose={() => setError(null)} />

      {/* HEADER */}
      <header className="col-span-24 flex flex-col md:flex-row justify-between items-center mb-12 py-10 border-b border-white/5 gap-8">
        <div>
          <h2 className="text-neon-green font-cinzel uppercase tracking-tighter m-0 leading-none text-4xl">{profile.name}'s Matrix</h2>
          <p className="text-neon-magenta text-xs font-black uppercase tracking-[0.4em] mt-4 opacity-50">Resonance Layer: {state.focusDimension} :: Node v2.8.2</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10">
            <button onClick={() => setFontPref('roboto')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${fontPref === 'roboto' ? 'bg-neon-blue text-black' : 'text-white/40'}`}>Roboto</button>
            <button onClick={() => setFontPref('cinzel')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${fontPref === 'cinzel' ? 'bg-neon-blue text-black' : 'text-white/40'}`}>Cinzel</button>
          </div>
          <button 
            onClick={() => setTheme(t => t === 'gradient' ? 'darker' : 'gradient')} 
            className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-neon-magenta/50 hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">{theme === 'gradient' ? 'dark_mode' : 'light_mode'}</span>
            Cycle Theme
          </button>
        </div>
      </header>

      {/* LEFT COLUMN */}
      <aside className="col-span-24 lg:col-span-10 space-y-12">
        <MentalShapeMatrix state={state} onChange={setState} />
        <LiveConversation />
        <VisualArsenal />
      </aside>

      {/* RIGHT COLUMN */}
      <main className="col-span-24 lg:col-span-14 space-y-12">
        <section className="bg-black/20 p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
            <h3 className="text-neon-blue m-0 font-cinzel text-3xl">Neural Wisdom</h3>
            <button onClick={fetchInsight} disabled={loading} className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest bg-neon-blue/20 hover:bg-neon-blue/40">Seek Insight</button>
          </div>
          {insight && (
            <div className="animate-in space-y-12">
              <div className="bg-gradient-to-br from-neon-blue/15 to-transparent p-12 rounded-[3rem] border border-neon-blue/20">
                <p className="font-cinzel text-4xl text-center leading-[1.3] text-white italic">"{insight.verse}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5">
                  <h6 className="text-neon-blue opacity-40 uppercase tracking-[0.4em] font-black text-[10px] mb-4">Philosophy</h6>
                  <p className="text-lg font-light leading-relaxed">{insight.philosophicalStatement}</p>
                </div>
                <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5">
                  <h6 className="text-neon-magenta opacity-40 uppercase tracking-[0.4em] font-black text-[10px] mb-4">Reframing</h6>
                  <p className="text-lg font-light leading-relaxed">{insight.modernReframing}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {yearlyPlan && (
          <section className="space-y-10">
            <h4 className="font-cinzel text-neon-yellow text-4xl tracking-widest text-center">Cosmic Roadmap</h4>
            <p className="text-center text-slate-400 max-w-2xl mx-auto italic mb-12">"{yearlyPlan.introduction}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {yearlyPlan.quarters.map((q, idx) => (
                <QuarterlyCard key={idx} focus={q} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-black/20 p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          <DecisionHistoryChart history={history} />
          <div className="flex items-center gap-8 mb-14">
            <h4 className="text-neon-yellow m-0 font-cinzel tracking-widest text-2xl">Decision Nexus</h4>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>
          <DecisionNexus state={state} onDecision={handleDecision} onUndo={handleUndo} canUndo={history.length > 0} />
        </section>

        <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
      </main>

      <footer className="col-span-24 py-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center opacity-30 text-[10px] uppercase tracking-[1em] font-black mt-24">
        <div>Neural Alignment Matrix :: Protocol v2.8.2</div>
        <div className="italic text-neon-blue tracking-[0.5em]">Prabhupada Framework Logic :: 0x43F-SYNC</div>
      </footer>
    </div>
  );
};

export default App;