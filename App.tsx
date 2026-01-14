
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
        setDetails(prev => ({ ...prev, [idx]: "Failed to expand details. Connection to the source interrupted." }));
      } finally {
        setLoadingDetails(prev => ({ ...prev, [idx]: false }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="m3-card bg-gradient-to-br from-[#4f378b] to-surface border border-white/5 relative overflow-hidden shadow-2xl">
        <h3 className="font-cinzel text-2xl text-accent mb-4 tracking-tight">Yearly Dedication Workflow</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">{plan.introduction}</p>
        <div className="bg-black/40 p-5 rounded-2xl border border-accent/20 italic text-accent text-sm shadow-xl flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl opacity-50">om</span>
          <span>"Core Lesson: {plan.coreSpiritualLesson}"</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.quarters.map((q, idx) => (
          <div 
            key={idx} 
            onClick={() => handleToggle(idx)}
            className={`m3-card border-l-8 border-accent transition-all duration-300 cursor-pointer group hover:bg-black/20 ${expandedIdx === idx ? 'md:col-span-2 bg-black/40 shadow-inner' : ''}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black uppercase text-subtext group-hover:text-accent transition-colors tracking-[0.2em]">{q.quarter}</span>
              <span className="text-xs font-cinzel text-accent font-bold tracking-widest">{q.theme}</span>
            </div>
            <p className="text-[15px] italic text-slate-100 mb-4 leading-relaxed font-light">"{q.gitaVerse}"</p>
            <div className="text-[11px] bg-accent/20 p-3 rounded-xl text-accent flex gap-3 items-center border border-accent/30">
              <span className="font-black uppercase tracking-widest">Activate:</span> {q.balancingAction}
            </div>
            {expandedIdx === idx && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                {loadingDetails[idx] ? (
                  <div className="text-[11px] text-subtext italic animate-pulse flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    Expanding neural Gita wisdom...
                  </div>
                ) : (
                  <div className="text-[14px] text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/60 p-6 rounded-2xl border border-white/10 font-light">
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

  const maxPoints = 12;
  const recentData = data.slice(-maxPoints);

  return (
    <div className="m3-card border border-white/10 space-y-6 bg-black/40 overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-[11px] uppercase font-black text-accent tracking-[0.3em]">Temporal Resonance Matrix</h4>
          <p className="text-[9px] text-subtext uppercase tracking-widest font-semibold opacity-50">Decisional Impact History</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></div><span className="text-[10px] font-black uppercase text-subtext tracking-widest">Emotion</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></div><span className="text-[10px] font-black uppercase text-subtext tracking-widest">Energy</span></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {recentData.map((d, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <span className="text-[9px] font-black text-subtext w-5 text-center opacity-40 group-hover:opacity-100 transition-all">P{i+1}</span>
            <div className="flex-1 h-3 flex gap-1 rounded-full overflow-hidden bg-white/5 border border-white/5 relative">
              <div 
                className="h-full bg-emerald-500/40 group-hover:bg-emerald-500/70 transition-all rounded-r"
                style={{ width: `${(d.emotionLevel + 100) / 2}%` }}
              />
              <div 
                className="h-full bg-amber-500/40 group-hover:bg-amber-500/70 transition-all rounded-r"
                style={{ width: `${d.energyVector}%`, marginLeft: '3px' }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                 <span className="text-[8px] font-black text-white/30 uppercase">E: {d.emotionLevel.toFixed(0)}</span>
                 <span className="text-[8px] font-black text-white/30 uppercase">V: {d.energyVector.toFixed(0)}</span>
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
        setErrorBanner("Neural roadmap synthesis failed. Ensure API access is valid.");
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
      setErrorBanner("Dynamic synthesis failed. Check connection or API project limits.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const shareInsight = () => {
    if (!insight) return;
    const text = `Gita Insight for ${profile?.name}:\n"${insight.verse}"\n\nLesson: ${insight.philosophicalStatement}\nModern: ${insight.modernReframing}`;
    if (navigator.share) {
      navigator.share({ title: 'Gita Neural Alignment', text });
    } else {
      navigator.clipboard.writeText(text);
      setErrorBanner("Wisdom sequence copied to local buffer.");
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'gradient' ? 'darker' : 'gradient');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="m3-card max-w-lg w-full p-10 text-center shadow-2xl bg-black/60 border border-white/5 scale-in">
          <h1 className="font-cinzel text-5xl mb-4 text-accent tracking-tighter">Gita Alignment</h1>
          <p className="text-subtext mb-10 text-xs tracking-[0.3em] font-black uppercase opacity-60 italic">Initialize Temporal Roadmap</p>
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[11px] text-accent uppercase font-black tracking-widest">Biological Name</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent text-base text-white shadow-inner"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-accent uppercase font-black tracking-widest">Initial Temporal Root</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent text-base text-white shadow-inner"
                value={tempProfile.birthDate}
                onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
              />
            </div>
            
            {!hasKey && (
              <div className="p-6 bg-accent/15 border border-accent/30 rounded-2xl text-[12px] text-accent text-left mb-4 shadow-inner">
                <p className="font-black uppercase tracking-widest mb-2">System Sequence Required</p>
                <p className="opacity-80 font-light text-slate-300">Advanced spiritual synthesis requires an established API sequence. Establish your key via the Google Cloud platform.</p>
                <button 
                  onClick={handleSelectKey} 
                  className="mt-4 text-sm font-black uppercase tracking-widest text-accent hover:underline"
                >
                  Establish Key Sequence
                </button>
              </div>
            )}

            <div className="pt-4">
              <button 
                onClick={handleStart} 
                disabled={loading}
                className="w-full bg-accent hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Synthesizing...' : 'Initiate Alignment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-[1700px] mx-auto space-y-10">
      {errorBanner && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] m3-card bg-rose-900/40 border-rose-500/50 px-8 py-4 flex items-center gap-6 animate-in slide-in-from-top duration-300 shadow-2xl">
           <span className="material-symbols-outlined text-rose-400">error</span>
           <span className="text-rose-400 text-[11px] font-black uppercase tracking-[0.2em]">{errorBanner}</span>
           <button onClick={() => setErrorBanner(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>
      )}

      {/* Header Grid Section */}
      <header className="m3-card grid grid-cols-24 gap-6 items-center border border-white/10 relative shadow-2xl bg-black/60">
        <div className="absolute top-6 right-8">
          <button 
            onClick={toggleTheme}
            className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-90 text-accent"
          >
            <span className="material-symbols-outlined">{theme === 'gradient' ? 'dark_mode' : 'light_mode'}</span>
          </button>
        </div>
        
        <div className="col-span-24 lg:col-span-14">
          <h2 className="font-cinzel text-4xl text-accent leading-tight tracking-tight shadow-accent/20 drop-shadow-sm">{profile.name}'s Alignment Matrix</h2>
          <p className="text-[11px] text-subtext uppercase tracking-[0.5em] font-black opacity-60 mt-2">
            System Protocol: Operational | Dynamic Matrix v2.7
          </p>
        </div>
        <div className="col-span-24 lg:col-span-10 flex flex-col lg:items-end gap-4">
          <div className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-white/5">
             <span className="text-[9px] uppercase font-black text-subtext tracking-widest opacity-50">Active Dimension</span>
             <select 
               value={state.focusDimension} 
               onChange={(e: any) => setState(s => ({ ...s, focusDimension: e.target.value as any }))}
               className="bg-transparent text-[11px] font-black uppercase text-accent focus:outline-none cursor-pointer border border-accent/20 rounded-lg px-3 py-1.5 tracking-wider transition-all hover:bg-white/5"
             >
                <option value="Material" className="bg-[#1c1b1f]">Material</option>
                <option value="Spiritual" className="bg-[#1c1b1f]">Spiritual</option>
                <option value="Digital" className="bg-[#1c1b1f]">Digital</option>
                <option value="Social" className="bg-[#1c1b1f]">Social</option>
             </select>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-subtext uppercase font-black tracking-[0.3em]">Resonance Frequency: <span className="text-accent ml-1">{state.energyVector.toFixed(0)}%</span></span>
            {!hasKey && (
               <button onClick={handleSelectKey} className="text-[11px] text-accent border border-accent/40 px-4 py-1.5 rounded-full hover:bg-accent/10 transition-all font-black uppercase tracking-widest">Authorize</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Grid Section */}
      <div className="grid-24">
        {/* Left Column (9/24) */}
        <div className="lg:col-span-9 space-y-10">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Right Column (15/24) */}
        <div className="lg:col-span-15 space-y-10">
          <section className="space-y-6">
             <div className="flex justify-between items-center border-b border-white/10 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-12 bg-accent rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
                    <div>
                      <h3 className="font-cinzel text-3xl text-accent tracking-tighter">Neural Synthesis</h3>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-subtext font-black opacity-80">Gita Predictive Analysis</p>
                    </div>
                </div>
                <div className="flex gap-4">
                  {insight && (
                    <button onClick={shareInsight} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95 text-slate-300">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  )}
                  <button 
                    onClick={fetchInsight} 
                    disabled={loading}
                    className="bg-accent/10 hover:bg-accent hover:text-black border border-accent/40 text-accent px-6 py-2.5 rounded-full font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Synthesizing...' : 'Seek Insight Sequence'}
                  </button>
                </div>
             </div>
             
             {insight ? (
               <div className="m3-card border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden animate-in slide-in-from-bottom duration-700 shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor" className="text-accent"><circle cx="50" cy="50" r="49" stroke="currentColor" strokeWidth="0.1" fill="none" /><circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.1" fill="none" /></svg>
                  </div>
                  <p className="italic text-3xl font-cinzel text-center mb-12 leading-relaxed text-white drop-shadow-2xl">"{insight.verse}"</p>
                  <div className="grid md:grid-cols-2 gap-10 relative z-10">
                     <div className="p-8 bg-black/60 rounded-3xl border border-white/5 relative group hover:border-accent/40 transition-all shadow-xl">
                        <span className="text-[10px] font-black text-accent uppercase block mb-5 tracking-[0.4em] opacity-80">Depth Logic</span>
                        <p className="text-[15px] italic leading-relaxed text-slate-200 font-light">{insight.philosophicalStatement}</p>
                     </div>
                     <div className="p-8 bg-black/60 rounded-3xl border border-white/5 relative group hover:border-accent/40 transition-all shadow-xl">
                        <span className="text-[10px] font-black text-accent uppercase block mb-5 tracking-[0.4em] opacity-80">Modern Mapping</span>
                        <p className="text-[15px] leading-relaxed text-slate-200 font-light">{insight.modernReframing}</p>
                     </div>
                  </div>
               </div>
             ) : (
                <div className="m3-card p-20 border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40 space-y-6">
                    <span className="material-symbols-outlined text-6xl animate-pulse">meditation</span>
                    <p className="text-[12px] italic tracking-[0.4em] uppercase font-black text-center leading-relaxed">Establish temporal resonance within a focus dimension<br/>to initiate divine neural synthesis</p>
                </div>
             )}
          </section>

          <section className="space-y-6">
              <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-accent/40 rounded-full"></div>
                  <h3 className="font-cinzel text-2xl text-accent/90 tracking-[0.3em]">Decision Nexus</h3>
              </div>
              
              <DecisionHistoryTimeline history={history} current={state} />

              <DecisionNexus 
                state={state} 
                onDecision={handleDecision} 
                onUndo={handleUndo} 
                canUndo={history.length > 0} 
              />
          </section>

          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          <SageChat focusDimension={state.focusDimension} emotionLevel={state.emotionLevel} />
        </div>
      </div>
      
      <footer className="py-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[11px] text-subtext uppercase tracking-[0.6em] font-black opacity-30 bg-black/40 px-10 rounded-t-[3rem]">
        <div>Neural Alignment Engine v2.7</div>
        <div className="mt-8 md:mt-0">Vedic System Protocol 0x43F | Grounded in Bhagavad-Gita "As It Is"</div>
      </footer>
    </div>
  );
};

export default App;
