
import React, { useState, useEffect } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication, getExpandedGitaDetails } from './services/geminiService';
import { COLORS } from './constants';

const YearlyRoadmap: React.FC<{ plan: YearlyDedication }> = ({ plan }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, string>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

  const handleToggle = async (idx: number) => {
    if (expandedIdx === idx) {
      setExpandedIdx(null);
      return;
    }
    setExpandedIdx(idx);

    if (!details[idx]) {
      setLoadingDetails(prev => ({ ...prev, [idx]: true }));
      try {
        const result = await getExpandedGitaDetails(plan.quarters[idx].gitaVerse, plan.quarters[idx].balancingAction);
        setDetails(prev => ({ ...prev, [idx]: result }));
      } catch (e) {
        setDetails(prev => ({ ...prev, [idx]: "Spiritual link timeout. Failed to expand deeper wisdom." }));
      } finally {
        setLoadingDetails(prev => ({ ...prev, [idx]: false }));
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="m3-card bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0c] border border-white/5 relative overflow-hidden shadow-2xl p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <h3 className="font-cinzel text-3xl text-accent mb-6 tracking-tight relative z-10">Yearly Dedication Workflow</h3>
        <p className="text-base text-slate-300 leading-relaxed mb-8 font-light relative z-10">{plan.introduction}</p>
        <div className="bg-black/60 p-6 rounded-[2rem] border border-accent/20 italic text-accent text-sm shadow-xl flex items-center gap-5 relative z-10">
          <span className="material-symbols-outlined text-4xl opacity-50">auto_awesome</span>
          <span className="text-base tracking-wide">"Core Lesson: {plan.coreSpiritualLesson}"</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plan.quarters.map((q, idx) => (
          <div 
            key={idx} 
            onClick={() => handleToggle(idx)}
            className={`
              relative flex flex-col p-8 bg-[#1c1b1f] border-l-8 border-accent 
              rounded-r-[2rem] rounded-l-lg transition-all duration-500 
              cursor-pointer group hover:bg-black/40 hover:translate-x-1
              ${expandedIdx === idx ? 'md:col-span-2 shadow-inner border-l-[12px]' : ''}
            `}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase text-subtext group-hover:text-accent transition-colors tracking-[0.3em]">{q.quarter}</span>
              <span className="text-sm font-cinzel text-accent font-bold tracking-widest">{q.theme}</span>
            </div>
            <p className="text-lg italic text-slate-100 mb-6 leading-relaxed font-light">"{q.gitaVerse}"</p>
            <div className="text-xs bg-accent/10 p-4 rounded-2xl text-accent flex gap-4 items-center border border-accent/20">
              <span className="font-black uppercase tracking-widest opacity-70">Balancing Protocol:</span> 
              <span className="font-medium tracking-wide">{q.balancingAction}</span>
            </div>
            {expandedIdx === idx && (
              <div className="mt-8 pt-8 border-t border-white/5 animate-in">
                {loadingDetails[idx] ? (
                  <div className="flex items-center gap-4 text-accent/50 italic text-xs animate-pulse">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing detailed Vedic expansion...
                  </div>
                ) : (
                  <div className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/40 p-8 rounded-[2rem] border border-white/5 font-light shadow-inner">
                    {details[idx]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Cumulative Impact Timeline:
 * Visually represents the sequence of past decisions and their cumulative impact.
 */
const DecisionHistoryTimeline: React.FC<{ history: AlignmentState[], current: AlignmentState }> = ({ history, current }) => {
  const data = [...history, current];
  if (data.length < 2) return null;

  const recentData = data.slice(-10);

  return (
    <div className="m3-card border border-white/5 space-y-8 bg-black/60 overflow-hidden shadow-2xl p-8 rounded-[2rem]">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[11px] uppercase font-black text-accent tracking-[0.4em]">Resonance History Matrix</h4>
          <p className="text-[9px] text-subtext uppercase tracking-widest font-semibold opacity-40 mt-1">Cumulative Temporal Drift</p>
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-[10px] font-black uppercase text-subtext tracking-widest opacity-60">Emotional Impact</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div><span className="text-[10px] font-black uppercase text-subtext tracking-widest opacity-60">Energy Surge</span></div>
        </div>
      </div>
      
      <div className="space-y-4">
        {recentData.map((d, i) => (
          <div key={i} className="flex items-center gap-6 group">
            <span className="text-[9px] font-black text-subtext w-8 opacity-20 group-hover:opacity-100 transition-opacity">T-{recentData.length - 1 - i}</span>
            <div className="flex-1 h-4 flex gap-1 rounded-full overflow-hidden bg-white/5 border border-white/5 relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-900 to-emerald-500 transition-all duration-700 ease-out shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                style={{ width: `${(d.emotionLevel + 100) / 2}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-700 ease-out shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                style={{ width: `${d.energyVector}%`, marginLeft: '2px' }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                 <span className="text-[8px] font-black text-white/50 tracking-tighter">EMO: {d.emotionLevel > 0 ? '+' : ''}{d.emotionLevel.toFixed(0)}</span>
                 <span className="text-[8px] font-black text-white/50 tracking-tighter">NRG: {d.energyVector.toFixed(0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: '', birthDate: '' });
  const [state, setState] = useState<AlignmentState>({
    emotionLevel: 0,
    energyVector: 50,
    focusDimension: 'Material'
  });
  const [history, setHistory] = useState<AlignmentState[]>([]);
  const [insight, setInsight] = useState<GitaInsight | null>(null);
  const [yearlyPlan, setYearlyPlan] = useState<YearlyDedication | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [theme, setTheme] = useState<'gradient' | 'darker'>('gradient');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    document.body.className = theme === 'gradient' ? 'gradient-bg min-h-screen' : 'darker-bg min-h-screen';
  }, [theme]);

  const handleStart = async () => {
    if (tempProfile.name && tempProfile.birthDate) {
      setLoading(true);
      setErrorBanner(null);
      try {
        const plan = await generateYearlyDedication(tempProfile);
        setYearlyPlan(plan);
        setProfile(tempProfile);
      } catch (e: any) {
        setErrorBanner("Roadmap synthesis timeout. Verification of API access required.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const fetchInsight = async () => {
    if (!profile) return;
    setLoading(true);
    setErrorBanner(null);
    try {
      const result = await generateGitaInsight(profile.name, {
        emotionLevel: state.emotionLevel,
        energyVector: state.energyVector,
        dimension: state.focusDimension
      });
      setInsight(result);
    } catch (error: any) {
      setErrorBanner("Cognitive alignment failure. Ensure API endpoint is reachable.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const shareInsight = () => {
    if (!insight) return;
    const text = `Gita Alignment for ${profile?.name}:\n"${insight.verse}"\n\nLesson: ${insight.philosophicalStatement}`;
    if (navigator.share) {
      navigator.share({ title: 'Neural Gita Resonance', text });
    } else {
      navigator.clipboard.writeText(text);
      setErrorBanner("Wisdom sequence cached to clipboard.");
      setTimeout(() => setErrorBanner(null), 3000);
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
    const lastState = history[history.length - 1];
    setState(lastState);
    setHistory(prev => prev.slice(0, -1));
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="m3-card max-w-lg w-full p-12 text-center shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] bg-[#1c1b1f]/90 border border-white/5 animate-in">
          <h1 className="font-cinzel text-5xl mb-4 text-accent tracking-tighter drop-shadow-2xl">Gita Alignment</h1>
          <p className="text-subtext mb-12 text-xs tracking-[0.4em] font-black uppercase opacity-40 italic">Initialize Temporal Roadmap</p>
          <div className="space-y-8 text-left">
            <div className="space-y-2">
              <label className="text-[10px] text-accent uppercase font-black tracking-widest ml-1">Biological Identity</label>
              <input
                type="text"
                placeholder="Full Legal or Biological Name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent text-base text-white shadow-inner transition-all hover:bg-white/[0.08]"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-accent uppercase font-black tracking-widest ml-1">Incarnation Root Date</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent text-base text-white shadow-inner transition-all hover:bg-white/[0.08]"
                value={tempProfile.birthDate}
                onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
              />
            </div>
            
            {!hasKey && (
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl text-[12px] text-accent text-left shadow-inner">
                <p className="font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">key</span> Key Required
                </p>
                <p className="opacity-60 font-light leading-relaxed">System requires a valid API sequence to proceed with neural Gita synthesis.</p>
                <button 
                  onClick={handleSelectKey} 
                  className="mt-4 text-[11px] font-black uppercase tracking-widest text-accent hover:underline hover:opacity-100 transition-all opacity-80"
                >
                  Establish Secure Sequence
                </button>
              </div>
            )}

            <div className="pt-4">
              <button 
                onClick={handleStart} 
                disabled={loading}
                className="w-full bg-accent hover:bg-orange-500 text-[#000] font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-4"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing...
                  </div>
                ) : (
                  <>Initiate Alignment <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">bolt</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1700px] mx-auto space-y-12">
      {errorBanner && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] m3-card bg-[#2d1111]/90 border-rose-500/30 px-8 py-5 flex items-center gap-8 animate-in shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-full border">
           <span className="material-symbols-outlined text-rose-500">warning</span>
           <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em]">{errorBanner}</span>
           <button onClick={() => setErrorBanner(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-50 hover:opacity-100">
              <span className="material-symbols-outlined text-base">close</span>
           </button>
        </div>
      )}

      {/* Header Section */}
      <header className="m3-card grid grid-cols-24 gap-8 items-center border border-white/5 relative shadow-2xl bg-black/60 p-10 rounded-[3rem]">
        <div className="absolute top-8 right-10 flex gap-4">
          <button 
            onClick={() => setTheme(prev => prev === 'gradient' ? 'darker' : 'gradient')}
            className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-90 text-accent group shadow-lg"
            title="Toggle Theme Resonance"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
              {theme === 'gradient' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
        
        <div className="col-span-24 lg:col-span-16">
          <h2 className="font-cinzel text-5xl text-accent leading-tight tracking-tighter drop-shadow-2xl">
            {profile.name}'s Alignment Matrix
          </h2>
          <p className="text-[10px] text-subtext uppercase tracking-[0.5em] font-black opacity-30 mt-3">
            System Identity Verified | Guna Dynamic Layer v2.7.4
          </p>
        </div>
        <div className="col-span-24 lg:col-span-8 flex flex-col lg:items-end gap-6">
          <div className="flex gap-4 items-center bg-black/40 p-4 rounded-3xl border border-white/5 shadow-inner">
             <span className="text-[10px] uppercase font-black text-subtext tracking-widest opacity-40">Active Context</span>
             <select 
               value={state.focusDimension} 
               onChange={(e: any) => setState(s => ({ ...s, focusDimension: e.target.value as any }))}
               className="bg-transparent text-[11px] font-black uppercase text-accent focus:outline-none cursor-pointer border border-accent/10 rounded-xl px-4 py-2 tracking-[0.1em] transition-all hover:bg-white/5"
             >
                <option value="Material" className="bg-[#1c1b1f]">Material Plane</option>
                <option value="Spiritual" className="bg-[#1c1b1f]">Spiritual Plane</option>
                <option value="Digital" className="bg-[#1c1b1f]">Digital Realm</option>
                <option value="Social" className="bg-[#1c1b1f]">Social Sphere</option>
             </select>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[11px] text-subtext uppercase font-black tracking-[0.4em]">Resonance: <span className="text-accent ml-2 text-lg">{state.energyVector.toFixed(0)}%</span></span>
            {!hasKey && (
               <button onClick={handleSelectKey} className="text-[10px] text-accent border border-accent/20 px-6 py-2 rounded-full hover:bg-accent/10 transition-all font-black uppercase tracking-widest shadow-lg">Authorize API</button>
            )}
          </div>
        </div>
      </header>

      {/* Core Matrix & Tools */}
      <div className="grid-24">
        {/* Left Control Column */}
        <div className="lg:col-span-10 space-y-12">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Right Wisdom Column */}
        <div className="lg:col-span-14 space-y-12">
          {/* Neural Insight Hub */}
          <section className="space-y-8">
             <div className="flex justify-between items-center border-b border-white/5 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-2.5 h-14 bg-accent rounded-full shadow-[0_0_25px_rgba(245,158,11,0.4)]"></div>
                    <div>
                      <h3 className="font-cinzel text-4xl text-accent tracking-tighter">Neural Synthesis</h3>
                      <p className="text-[10px] uppercase tracking-[0.5em] text-subtext font-black opacity-30">Predictive Vedic Analysis</p>
                    </div>
                </div>
                <div className="flex gap-4">
                  {insight && (
                    <button onClick={shareInsight} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95 text-slate-300 shadow-xl" title="Share Wisdom Sequence">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  )}
                  <button 
                    onClick={fetchInsight} 
                    disabled={loading}
                    className="bg-accent/10 hover:bg-accent hover:text-black border border-accent/20 text-accent px-10 py-3.5 rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center gap-3"
                  >
                    {loading ? 'Synthesizing...' : <><span className="material-symbols-outlined text-base">psychology</span> Seek Insight</>}
                  </button>
                </div>
             </div>
             
             {insight ? (
               <div className="m3-card border border-accent/10 bg-gradient-to-br from-accent/[0.03] to-transparent relative overflow-hidden animate-in shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] p-12 rounded-[3rem]">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <svg width="250" height="250" viewBox="0 0 100 100" fill="currentColor" className="text-accent">
                        <circle cx="50" cy="50" r="49" stroke="currentColor" strokeWidth="0.05" fill="none" />
                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.05" fill="none" />
                      </svg>
                  </div>
                  <p className="italic text-4xl font-cinzel text-center mb-16 leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">"{insight.verse}"</p>
                  <div className="grid md:grid-cols-2 gap-12 relative z-10">
                     <div className="p-10 bg-black/60 rounded-[2.5rem] border border-white/5 group hover:border-accent/30 transition-all shadow-2xl">
                        <span className="text-[10px] font-black text-accent uppercase block mb-6 tracking-[0.5em] opacity-40 italic">Depth Sequence</span>
                        <p className="text-[17px] italic leading-relaxed text-slate-200 font-light">{insight.philosophicalStatement}</p>
                     </div>
                     <div className="p-10 bg-black/60 rounded-[2.5rem] border border-white/5 group hover:border-accent/30 transition-all shadow-2xl">
                        <span className="text-[10px] font-black text-accent uppercase block mb-6 tracking-[0.5em] opacity-40 italic">Modern Mapping</span>
                        <p className="text-[17px] leading-relaxed text-slate-200 font-light">{insight.modernReframing}</p>
                     </div>
                  </div>
               </div>
             ) : (
                <div className="m3-card p-24 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-20 space-y-8 rounded-[3rem]">
                    <span className="material-symbols-outlined text-8xl animate-pulse">center_focus_weak</span>
                    <p className="text-[12px] italic tracking-[0.5em] uppercase font-black text-center leading-relaxed">Seek resonance within a context dimension<br/>to trigger divine neural synthesis</p>
                </div>
             )}
          </section>

          {/* Decision Matrix */}
          <section className="space-y-10">
              <div className="flex items-center gap-6">
                  <div className="w-2.5 h-10 bg-accent/30 rounded-full"></div>
                  <h3 className="font-cinzel text-3xl text-accent/80 tracking-[0.4em]">Decision Nexus</h3>
              </div>
              
              <DecisionHistoryTimeline history={history} current={state} />

              <DecisionNexus 
                state={state} 
                onDecision={handleDecision} 
                onUndo={handleUndo} 
                canUndo={history.length > 0} 
              />
          </section>

          {/* Yearly Roadmap */}
          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          {/* Chat / Consultation */}
          <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
        </div>
      </div>
      
      <footer className="py-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-subtext uppercase tracking-[0.8em] font-black opacity-20 bg-black/40 px-12 rounded-t-[4rem]">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-base">hub</span>
          Neural Alignment Matrix Engine v2.7.4-STABLE
        </div>
        <div className="mt-12 md:mt-0 italic">Grounded in Bhagavad-Gita "As It Is" | Vedabase Protocol 0x43F</div>
      </footer>
    </div>
  );
};

export default App;
