import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const DecisionHistoryChart: React.FC<{ history: AlignmentState[] }> = ({ history }) => {
  if (history.length === 0) return null;
  
  const chartWidth = 100; // percent
  const maxHistory = 10;
  const recentHistory = history.slice(-maxHistory);
  
  return (
    <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 shadow-xl mb-8 animate-in">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] uppercase font-black tracking-widest text-neon-magenta">Impact Sequence</h5>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-neon-green rounded-full"></div><span className="text-[8px] uppercase tracking-widest text-white/40">Emotion</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-neon-blue rounded-full"></div><span className="text-[8px] uppercase tracking-widest text-white/40">Energy</span></div>
        </div>
      </div>
      <div className="flex items-end gap-2 h-24 w-full px-2 overflow-x-auto">
        {recentHistory.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1 min-w-[12px]">
            <div 
              className="w-full bg-neon-green/40 rounded-t-sm transition-all duration-500" 
              style={{ height: `${Math.abs(s.emotionLevel + 100) / 2}%` }}
              title={`Emotion: ${s.emotionLevel.toFixed(1)}`}
            ></div>
            <div 
              className="w-full bg-neon-blue/40 rounded-t-sm transition-all duration-500" 
              style={{ height: `${s.energyVector}%` }}
              title={`Energy: ${s.energyVector.toFixed(1)}`}
            ></div>
          </div>
        ))}
      </div>
      <p className="text-[8px] uppercase tracking-widest text-white/20 mt-4 text-center">Timeline Analysis of Last {recentHistory.length} Shifts</p>
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
        setDetails("Alignment details currently unavailable in the cosmic record.");
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
            <p className="text-sm leading-relaxed text-slate-200 bg-white/5 p-6 rounded-2xl italic">
              {details}
            </p>
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
        message: 'Temporal root credentials incomplete.',
        steps: ['Ensure both identity name and temporal point (date) are populated.', 'Verify the validity of the birth date structure.'],
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
        message: "Neural roadmap initialization failure. The matrix could not resolve your temporal signature.", 
        steps: ['Verify your API network connectivity.', 'Check if your spiritual key is correctly selected.', 'Try again in a few moments.'],
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
        steps: ['Attempt to re-align your Mental Matrix node.', 'Check network.', 'Re-trigger seeking.'],
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
        <div className="content-narrow bg-black/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 shadow-2xl animate-in text-center">
          <h1 className="font-cinzel text-neon-red mb-8 text-6xl">Gita Matrix</h1>
          <div className="space-y-8 text-left">
            <input type="text" placeholder="Identity Name" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} />
            <input type="date" value={tempProfile.birthDate} onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })} />
            <button onClick={handleStart} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg">Initiate Alignment</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-container animate-in">
      <GlobalLoader loading={loading} />
      
      {/* HEADER */}
      <header className="col-span-24 flex flex-col md:flex-row justify-between items-center mb-12 py-10 border-b border-white/5 gap-8">
        <div>
          <h2 className="text-neon-green font-cinzel uppercase tracking-tighter m-0 border-none p-0 leading-none text-4xl">{profile.name}'s Matrix</h2>
          <p className="text-neon-magenta text-xs font-black uppercase tracking-[0.4em] mt-4 opacity-50">Resonance Layer: {state.focusDimension} :: Node v2.8.2</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10 shadow-inner">
            <button onClick={() => setFontPref('roboto')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${fontPref === 'roboto' ? 'bg-neon-blue' : 'bg-transparent'}`}>Roboto</button>
            <button onClick={() => setFontPref('cinzel')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${fontPref === 'cinzel' ? 'bg-neon-blue' : 'bg-transparent'}`}>Cinzel</button>
          </div>
          <button onClick={() => setTheme(t => t === 'gradient' ? 'darker' : 'gradient')} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Cycle Theme</button>
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
        {/* Wisdom Synthesis */}
        <section className="bg-black/20 p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
            <h3 className="text-neon-blue m-0 font-cinzel text-3xl">Neural Wisdom</h3>
            <button onClick={fetchInsight} disabled={loading} className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest">Seek Insight</button>
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

        {/* YEARLY ROADMAP */}
        {yearlyPlan && (
          <section className="col-span-24 space-y-10">
            <h4 className="font-cinzel text-neon-yellow text-4xl tracking-widest text-center">Cosmic Roadmap</h4>
            <p className="text-center text-slate-400 max-w-2xl mx-auto italic mb-12">"{yearlyPlan.introduction}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {yearlyPlan.quarters.map((q, idx) => (
                <QuarterlyCard key={idx} focus={q} />
              ))}
            </div>
          </section>
        )}

        {/* DECISION SECTION */}
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