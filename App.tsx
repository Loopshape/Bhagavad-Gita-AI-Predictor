
import React, { useState, useEffect } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication } from './services/geminiService';

const YearlyRoadmap: React.FC<{ plan: YearlyDedication }> = ({ plan }) => (
  <div className="space-y-6">
    <div className="glass p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent border border-white/10">
      <h3 className="font-cinzel text-xl text-accent mb-2">Yearly Dedication Workflow</h3>
      <p className="text-sm text-subtext leading-relaxed mb-4">{plan.introduction}</p>
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic text-accent text-sm shadow-inner">
        "Core Lesson: {plan.coreSpiritualLesson}"
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plan.quarters.map((q, idx) => (
        <div key={idx} className="glass p-5 rounded-xl border-l-4 border-accent hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] cursor-default group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase text-subtext group-hover:text-accent transition-colors">{q.quarter}</span>
            <span className="text-xs font-cinzel text-accent">{q.theme}</span>
          </div>
          <p className="text-xs italic text-slate-300 mb-3 leading-relaxed">"{q.gitaVerse}"</p>
          <div className="text-[10px] bg-accent/10 p-2 rounded text-accent flex gap-2 items-center border border-accent/5">
            <span className="font-bold">ACTIVATE:</span> {q.balancingAction}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: '', birthDate: '' });
  const [state, setState] = useState<AlignmentState>({
    emotionLevel: 0,
    energyVector: 50,
    focusDimension: 'Material'
  });
  const [insight, setInsight] = useState<GitaInsight | null>(null);
  const [yearlyPlan, setYearlyPlan] = useState<YearlyDedication | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleStart = async () => {
    if (tempProfile.name && tempProfile.birthDate) {
      setLoading(true);
      try {
        const plan = await generateYearlyDedication(tempProfile);
        setYearlyPlan(plan);
        setProfile(tempProfile);
      } catch (e: any) {
        console.error(e);
        setProfile(tempProfile);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const shareInsight = () => {
    if (!insight) return;
    const text = `Gita Insight for ${profile?.name}:\n"${insight.verse}"\n\nLesson: ${insight.philosophicalStatement}\nModern: ${insight.modernReframing}`;
    if (navigator.share) {
      navigator.share({ title: 'Gita Alignment Insight', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Insight copied to clipboard!');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 matrix-overlay">
        <div className="glass max-w-md w-full p-8 rounded-3xl text-center border border-white/10 shadow-2xl">
          <h1 className="font-cinzel text-4xl mb-2 text-accent">Gita Alignment</h1>
          <p className="text-subtext mb-8 text-sm italic">Initialize your personalized year workflow.</p>
          <div className="space-y-4 text-left">
            <label className="text-[10px] text-accent uppercase font-bold ml-1">Identity Vector</label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-sm text-white"
              value={tempProfile.name}
              onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
            />
            <label className="text-[10px] text-accent uppercase font-bold ml-1">Temporal Root</label>
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-sm text-white"
              value={tempProfile.birthDate}
              onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
            />
            
            {!hasKey && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-[10px] text-accent text-left mb-2">
                <p className="font-bold mb-1">Key Selection Required</p>
                <p>To use high-quality features (2K/4K, Native Audio), please select a paid API key.</p>
                <button 
                  onClick={handleSelectKey}
                  className="mt-2 underline font-bold"
                >Select API Key (ai.google.dev/gemini-api/docs/billing)</button>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-accent hover:bg-orange-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Synthesizing Roadmap...' : 'Begin Year Workflow'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Grid Section */}
      <header className="glass p-6 rounded-2xl grid grid-cols-24 gap-4 items-center border border-white/10">
        <div className="col-span-24 lg:col-span-12">
          <h2 className="font-cinzel text-3xl text-accent leading-tight">{profile.name}'s Alignment</h2>
          <p className="text-[10px] text-subtext uppercase tracking-[0.3em] font-semibold opacity-70">
            System Protocol: Operational | Dynamic Matrix v1.0
          </p>
        </div>
        <div className="col-span-24 lg:col-span-12 flex flex-col lg:items-end gap-3">
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
            {['Material', 'Spiritual', 'Digital', 'Social'].map(dim => (
              <button
                key={dim}
                onClick={() => setState(s => ({ ...s, focusDimension: dim as any }))}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  state.focusDimension === dim 
                  ? 'bg-accent border-accent text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                  : 'bg-transparent border-transparent text-subtext hover:border-white/10 hover:text-white'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-subtext uppercase font-bold">Resonance Level: <span className="text-accent">{state.energyVector.toFixed(0)}%</span></span>
            {!hasKey && (
               <button onClick={handleSelectKey} className="text-[10px] text-accent border border-accent/40 px-3 py-1 rounded-lg hover:bg-accent/5">Update API Key</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Grid Section */}
      <div className="grid-24">
        {/* Left Column (8/24) */}
        <div className="lg:col-span-8 space-y-8 h-full">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Right Column (16/24) */}
        <div className="lg:col-span-16 space-y-8">
          <section className="space-y-4">
             <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-accent rounded-full"></div>
                    <h3 className="font-cinzel text-2xl text-accent">Spiritual Synthesis</h3>
                </div>
                <div className="flex gap-3">
                  {insight && (
                    <button 
                      onClick={shareInsight} 
                      className="text-[10px] font-bold border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 group"
                    >
                      <span className="opacity-70 group-hover:opacity-100">Share Insight</span>
                    </button>
                  )}
                  <button 
                    onClick={fetchInsight}
                    disabled={loading}
                    className={`text-[10px] font-bold border border-accent/30 px-6 py-2 rounded-xl transition-all shadow-sm ${
                        loading 
                        ? 'opacity-50 cursor-wait bg-accent/5' 
                        : 'bg-accent/5 hover:bg-accent/20 hover:border-accent text-accent'
                    }`}
                  >
                    {loading ? 'Synthesizing...' : 'Seek Deeper Insight'}
                  </button>
                </div>
             </div>
             
             {insight ? (
               <div className="glass p-8 rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden animate-in slide-in-from-bottom duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
                  </div>
                  <p className="italic text-xl font-cinzel text-center mb-8 leading-relaxed text-white">"{insight.verse}"</p>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="p-5 bg-black/40 rounded-2xl border border-white/5 relative group hover:border-accent/30 transition-all">
                        <span className="text-[9px] font-black text-accent uppercase block mb-2 tracking-widest">Deeper Insight</span>
                        <p className="text-[13px] italic leading-relaxed text-slate-300">{insight.philosophicalStatement}</p>
                     </div>
                     <div className="p-5 bg-black/40 rounded-2xl border border-white/5 relative group hover:border-accent/30 transition-all">
                        <span className="text-[9px] font-black text-accent uppercase block mb-2 tracking-widest">Modern Framing</span>
                        <p className="text-[13px] leading-relaxed text-slate-300">{insight.modernReframing}</p>
                     </div>
                  </div>
               </div>
             ) : (
                <div className="glass p-12 rounded-3xl border border-dashed border-white/10 flex items-center justify-center opacity-40">
                    <p className="text-xs italic tracking-widest uppercase">Select Focus Dimension and seek insight to begin</p>
                </div>
             )}
          </section>

          <section className="space-y-4">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-accent/40 rounded-full"></div>
                  <h3 className="font-cinzel text-xl text-accent/80">Decision Nexus</h3>
              </div>
              <DecisionNexus state={state} onDecision={impact => {
                 setState(prev => ({
                    ...prev,
                    emotionLevel: Math.max(-100, Math.min(100, prev.emotionLevel + (impact.emotionLevel || 0))),
                    energyVector: Math.max(0, Math.min(100, prev.energyVector + (impact.energyVector || 0)))
                 }));
              }} />
          </section>

          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          <SageChat />
        </div>
      </div>
      
      <footer className="py-8 border-t border-white/10 flex justify-between items-center text-[9px] text-subtext uppercase tracking-widest font-semibold opacity-60">
        <div>Proprietary Spiritual Alignment Engine v2.4</div>
        <div>Based on Bhagavad-Gita "As It Is" | AI System Protocol 0x43F</div>
      </footer>
    </div>
  );
};

export default App;
