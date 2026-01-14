
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
    <div className="space-y-10">
      <div className="m3-card bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0c] border border-white/5 relative overflow-hidden shadow-2xl p-12 rounded-[3rem]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <h3 className="font-cinzel text-4xl text-accent mb-8 tracking-tight relative z-10">Yearly Dedication Workflow</h3>
        <p className="text-lg text-slate-300 leading-relaxed mb-10 font-light relative z-10">{plan.introduction}</p>
        <div className="bg-black/70 p-8 rounded-[2.5rem] border border-accent/30 italic text-accent text-base shadow-2xl flex items-center gap-6 relative z-10 group hover:border-accent transition-all duration-500">
          <span className="material-symbols-outlined text-5xl opacity-40 group-hover:opacity-100 transition-opacity">auto_awesome</span>
          <span className="text-lg tracking-wide font-medium">"Core Spiritual Lesson: {plan.coreSpiritualLesson}"</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {plan.quarters.map((q, idx) => (
          <div 
            key={idx} 
            onClick={() => handleToggle(idx)}
            className={`
              relative flex flex-col p-10 bg-[#1c1b1f] border-l-[10px] border-accent 
              rounded-r-[3rem] rounded-l-xl transition-all duration-700 ease-in-out
              cursor-pointer group hover:bg-black/50 hover:translate-x-2 shadow-xl
              ${expandedIdx === idx ? 'md:col-span-2 shadow-2xl border-l-[16px] bg-black/60' : ''}
            `}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-[11px] font-black uppercase text-subtext group-hover:text-accent transition-colors tracking-[0.4em] opacity-40 group-hover:opacity-100">{q.quarter}</span>
              <span className="text-base font-cinzel text-accent font-bold tracking-[0.2em]">{q.theme}</span>
            </div>
            <p className="text-xl italic text-slate-100 mb-8 leading-relaxed font-light">"{q.gitaVerse}"</p>
            <div className="text-[13px] bg-accent/10 p-5 rounded-2xl text-accent flex gap-5 items-center border border-accent/20 group-hover:bg-accent/20 transition-all">
              <span className="font-black uppercase tracking-widest opacity-60">Balancing Protocol:</span> 
              <span className="font-semibold tracking-wide">{q.balancingAction}</span>
            </div>
            {expandedIdx === idx && (
              <div className="mt-10 pt-10 border-t border-white/10 animate-in slide-in-from-top-4 duration-1000">
                {loadingDetails[idx] ? (
                  <div className="flex items-center gap-5 text-accent/60 italic text-sm animate-pulse p-4">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing detailed Vedic expansion...
                  </div>
                ) : (
                  <div className="text-[16px] text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/50 p-10 rounded-[2.5rem] border border-white/5 font-light shadow-inner">
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

const DecisionHistoryTimeline: React.FC<{ history: AlignmentState[], current: AlignmentState }> = ({ history, current }) => {
  const data = [...history, current];
  if (data.length < 2) return null;

  const recentData = data.slice(-8);

  return (
    <div className="m3-card border border-white/5 space-y-10 bg-black/70 overflow-hidden shadow-2xl p-10 rounded-[3rem] relative">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[12px] uppercase font-black text-accent tracking-[0.5em]">Resonance Drift Timeline</h4>
          <p className="text-[10px] text-subtext uppercase tracking-widest font-semibold opacity-30 mt-2">Cumulative Decision Sequence</p>
        </div>
        <div className="flex gap-10">
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div><span className="text-[11px] font-black uppercase text-subtext tracking-widest opacity-50">Emotional Path</span></div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"></div><span className="text-[11px] font-black uppercase text-subtext tracking-widest opacity-50">Energy Vector</span></div>
        </div>
      </div>
      
      <div className="space-y-5">
        {recentData.map((d, i) => (
          <div key={i} className="flex items-center gap-8 group">
            <span className="text-[10px] font-black text-subtext w-12 opacity-20 group-hover:opacity-100 transition-all duration-300">STEP {i + 1}</span>
            <div className="flex-1 h-5 flex gap-1 rounded-full overflow-hidden bg-white/[0.02] border border-white/5 relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-950 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${(d.emotionLevel + 100) / 2}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-amber-950 to-amber-500 transition-all duration-1000 ease-out"
                style={{ width: `${d.energyVector}%`, marginLeft: '3px' }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                 <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">Affection: {d.emotionLevel.toFixed(0)}</span>
                 <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">Energy: {d.energyVector.toFixed(0)}</span>
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
        setErrorBanner("Neural roadmap synthesis timeout. Verification of API access required.");
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
        <div className="m3-card max-w-lg w-full p-12 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] bg-[#1c1b1f]/95 border border-white/10 animate-in rounded-[3.5rem]">
          <h1 className="font-cinzel text-6xl mb-4 text-accent tracking-tighter drop-shadow-3xl">Gita Alignment</h1>
          <p className="text-subtext mb-14 text-xs tracking-[0.6em] font-black uppercase opacity-40 italic">Initialize Temporal Roadmap</p>
          <div className="space-y-10 text-left">
            <div className="space-y-3">
              <label className="text-[11px] text-accent uppercase font-black tracking-[0.3em] ml-2">Biological Identity</label>
              <input
                type="text"
                placeholder="Full Biological Name"
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 focus:outline-none focus:border-accent text-lg text-white shadow-inner transition-all hover:bg-white/[0.08]"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] text-accent uppercase font-black tracking-[0.3em] ml-2">Incarnation Root Date</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 focus:outline-none focus:border-accent text-lg text-white shadow-inner transition-all hover:bg-white/[0.08]"
                value={tempProfile.birthDate}
                onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
              />
            </div>
            
            {!hasKey && (
              <div className="p-8 bg-accent/[0.03] border border-accent/20 rounded-[2rem] text-[13px] text-accent text-left shadow-inner transition-all hover:bg-accent/[0.05]">
                <p className="font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">key</span> Secure Connection Required
                </p>
                <p className="opacity-60 font-light leading-relaxed">System requires a verified API sequence to trigger deep neural Gita synthesis and predictive analysis.</p>
                <button 
                  onClick={handleSelectKey} 
                  className="mt-5 text-[12px] font-black uppercase tracking-widest text-accent hover:underline hover:opacity-100 transition-all opacity-80"
                >
                  Establish Secure Sequence Trace
                </button>
              </div>
            )}

            <div className="pt-6">
              <button 
                onClick={handleStart} 
                disabled={loading}
                className="w-full bg-accent hover:bg-orange-500 text-[#000] font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(245,158,11,0.5)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-5"
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                    Synthesizing Protocol...
                  </div>
                ) : (
                  <>Initiate Matrix Alignment <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">bolt</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-16 max-w-[1800px] mx-auto space-y-16">
      {errorBanner && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] m3-card bg-[#2d1111]/95 border-rose-500/40 px-10 py-6 flex items-center gap-8 animate-in shadow-2xl rounded-full border">
           <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
           <span className="text-rose-400 text-[11px] font-black uppercase tracking-[0.4em]">{errorBanner}</span>
           <button onClick={() => setErrorBanner(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100">
              <span className="material-symbols-outlined text-xl">close</span>
           </button>
        </div>
      )}

      {/* Header Section */}
      <header className="m3-card grid grid-cols-24 gap-12 items-center border border-white/5 relative shadow-3xl bg-black/70 p-12 rounded-[4rem]">
        <div className="absolute top-10 right-12 flex gap-6">
          <button 
            onClick={() => setTheme(prev => prev === 'gradient' ? 'darker' : 'gradient')}
            className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-90 text-accent group shadow-2xl"
            title="Toggle Matrix Theme Resonance"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700 text-2xl">
              {theme === 'gradient' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
        
        <div className="col-span-24 lg:col-span-16">
          <h2 className="font-cinzel text-6xl text-accent leading-none tracking-tighter drop-shadow-3xl">
            {profile.name}'s Alignment Matrix
          </h2>
          <p className="text-[12px] text-subtext uppercase tracking-[0.8em] font-black opacity-30 mt-6 ml-1">
            Verified Identity Trace | System Guna Dynamic v2.8.1-STABLE
          </p>
        </div>
        <div className="col-span-24 lg:col-span-8 flex flex-col lg:items-end gap-8">
          <div className="flex gap-6 items-center bg-black/50 p-5 rounded-[2rem] border border-white/5 shadow-inner">
             <span className="text-[11px] uppercase font-black text-subtext tracking-widest opacity-40">Active Context</span>
             <select 
               value={state.focusDimension} 
               onChange={(e: any) => setState(s => ({ ...s, focusDimension: e.target.value as any }))}
               className="bg-transparent text-[13px] font-black uppercase text-accent focus:outline-none cursor-pointer border border-accent/20 rounded-2xl px-6 py-3 tracking-[0.2em] transition-all hover:bg-white/5 shadow-lg"
             >
                <option value="Material" className="bg-[#1c1b1f]">Material Plane</option>
                <option value="Spiritual" className="bg-[#1c1b1f]">Spiritual Plane</option>
                <option value="Digital" className="bg-[#1c1b1f]">Digital Realm</option>
                <option value="Social" className="bg-[#1c1b1f]">Social Sphere</option>
             </select>
          </div>
          <div className="flex items-center gap-10">
            <span className="text-[12px] text-subtext uppercase font-black tracking-[0.5em]">Resonance: <span className="text-accent ml-3 text-3xl font-light">{state.energyVector.toFixed(0)}%</span></span>
            {!hasKey && (
               <button onClick={handleSelectKey} className="text-[11px] text-accent border border-accent/30 px-8 py-3 rounded-full hover:bg-accent/10 transition-all font-black uppercase tracking-widest shadow-2xl">Re-Authorize API</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Alignment Layout */}
      <div className="grid-24">
        {/* Primary Controls & Oracle Column */}
        <div className="lg:col-span-11 space-y-16">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Predictive Wisdom Column */}
        <div className="lg:col-span-13 space-y-16">
          {/* Neural Wisdom Interface */}
          <section className="space-y-10">
             <div className="flex justify-between items-center border-b border-white/5 pb-12 px-2">
                <div className="flex items-center gap-8">
                    <div className="w-3 h-16 bg-accent rounded-full shadow-[0_0_35px_rgba(245,158,11,0.5)]"></div>
                    <div>
                      <h3 className="font-cinzel text-5xl text-accent tracking-tighter">Neural Synthesis</h3>
                      <p className="text-[11px] uppercase tracking-[0.6em] text-subtext font-black opacity-30 mt-2">Predictive Vedic Cognition Engine</p>
                    </div>
                </div>
                <div className="flex gap-5">
                  {insight && (
                    <button onClick={shareInsight} className="p-5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95 text-slate-300 shadow-2xl group" title="Share Wisdom Sequence">
                      <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">share</span>
                    </button>
                  )}
                  <button 
                    onClick={fetchInsight} 
                    disabled={loading}
                    className="bg-accent/10 hover:bg-accent hover:text-black border border-accent/30 text-accent px-12 py-4 rounded-full font-black uppercase tracking-[0.3em] transition-all shadow-3xl active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group flex items-center gap-4"
                  >
                    {loading ? 'Synthesizing Wisdom...' : <><span className="material-symbols-outlined text-xl">psychology_alt</span> Seek New Insight</>}
                  </button>
                </div>
             </div>
             
             {insight ? (
               <div className="m3-card border border-accent/15 bg-gradient-to-br from-accent/[0.04] to-transparent relative overflow-hidden animate-in shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] p-16 rounded-[4rem]">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
                      <svg width="350" height="350" viewBox="0 0 100 100" fill="currentColor" className="text-accent animate-slow-spin">
                        <circle cx="50" cy="50" r="49" stroke="currentColor" strokeWidth="0.05" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.05" fill="none" />
                        <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="0.05" />
                      </svg>
                  </div>
                  <p className="italic text-5xl font-cinzel text-center mb-20 leading-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">"{insight.verse}"</p>
                  <div className="grid md:grid-cols-2 gap-16 relative z-10">
                     <div className="p-12 bg-black/70 rounded-[3rem] border border-white/5 group hover:border-accent/40 transition-all duration-500 shadow-3xl">
                        <span className="text-[11px] font-black text-accent uppercase block mb-8 tracking-[0.6em] opacity-30 italic">Depth Sequence Trace</span>
                        <p className="text-[18px] italic leading-relaxed text-slate-200 font-light tracking-wide">{insight.philosophicalStatement}</p>
                     </div>
                     <div className="p-12 bg-black/70 rounded-[3rem] border border-white/5 group hover:border-accent/40 transition-all duration-500 shadow-3xl">
                        <span className="text-[11px] font-black text-accent uppercase block mb-8 tracking-[0.6em] opacity-30 italic">Modern Pattern Mapping</span>
                        <p className="text-[18px] leading-relaxed text-slate-200 font-light tracking-wide">{insight.modernReframing}</p>
                     </div>
                  </div>
               </div>
             ) : (
                <div className="m3-card p-32 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-10 space-y-12 rounded-[4rem] group hover:opacity-20 transition-all duration-1000">
                    <span className="material-symbols-outlined text-9xl animate-pulse group-hover:scale-110 transition-transform">auto_stories</span>
                    <p className="text-[14px] italic tracking-[0.6em] uppercase font-black text-center leading-relaxed">Establish focus within a dimension<br/>to trigger divine neural matrix synthesis</p>
                </div>
             )}
          </section>

          {/* Decision Architecture */}
          <section className="space-y-12">
              <div className="flex items-center gap-8 px-2">
                  <div className="w-3 h-12 bg-accent/40 rounded-full"></div>
                  <h3 className="font-cinzel text-4xl text-accent/90 tracking-[0.5em]">Decision Nexus</h3>
              </div>
              
              <DecisionHistoryTimeline history={history} current={state} />

              <DecisionNexus 
                state={state} 
                onDecision={handleDecision} 
                onUndo={handleUndo} 
                canUndo={history.length > 0} 
              />
          </section>

          {/* Dynamic Yearly Roadmap */}
          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          {/* Deep Chat Consultation */}
          <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
        </div>
      </div>
      
      <footer className="py-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[11px] text-subtext uppercase tracking-[1em] font-black opacity-20 bg-black/50 px-16 rounded-t-[5rem]">
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-xl">hub</span>
          Neural Alignment Engine v2.8.1-STABLE [0x43F]
        </div>
        <div className="mt-12 md:mt-0 italic tracking-[0.2em] font-light">Grounded in Bhagavad-Gita "As It Is" by A.C. Bhaktivedanta Swami Prabhupada</div>
      </footer>

      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
