
import React, { useState } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import SageChat from './components/SageChat';
import VisualArsenal from './components/VisualArsenal';
import LiveConversation from './components/LiveConversation';
import { generateGitaInsight, generateYearlyDedication } from './services/geminiService';

const YearlyRoadmap: React.FC<{ plan: YearlyDedication }> = ({ plan }) => (
  <div className="space-y-6">
    <div className="glass p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent">
      <h3 className="font-cinzel text-xl text-accent mb-2">Yearly Dedication Workflow</h3>
      <p className="text-sm text-subtext leading-relaxed mb-4">{plan.introduction}</p>
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic text-accent text-sm">
        "Core Lesson: {plan.coreSpiritualLesson}"
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {plan.quarters.map((q, idx) => (
        <div key={idx} className="glass p-5 rounded-xl border-l-4 border-accent hover:border-white transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase text-subtext">{q.quarter}</span>
            <span className="text-xs font-cinzel text-accent">{q.theme}</span>
          </div>
          <p className="text-xs italic text-slate-300 mb-3">"{q.gitaVerse}"</p>
          <div className="text-[10px] bg-accent/10 p-2 rounded text-accent flex gap-2 items-center">
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

  const handleStart = async () => {
    if (tempProfile.name && tempProfile.birthDate) {
      setLoading(true);
      try {
        const plan = await generateYearlyDedication(tempProfile);
        setYearlyPlan(plan);
        setProfile(tempProfile);
      } catch (e) {
        console.error(e);
        setProfile(tempProfile);
      } finally {
        setLoading(false);
      }
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
        <div className="glass max-w-md w-full p-8 rounded-3xl text-center">
          <h1 className="font-cinzel text-4xl mb-2 text-accent">Gita Alignment</h1>
          <p className="text-subtext mb-8 text-sm italic">Initialize your personalized year workflow.</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-sm"
              value={tempProfile.name}
              onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-sm"
              value={tempProfile.birthDate}
              onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
            />
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-accent hover:bg-orange-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? 'Synthesizing Roadmap...' : 'Begin Year Workflow'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-cinzel text-2xl text-accent">{profile.name}'s Alignment</h2>
          <p className="text-[10px] text-subtext uppercase tracking-[0.2em]">Matrix Status: Operational | Year Workflow Active</p>
        </div>
        <div className="flex gap-4">
          {['Material', 'Spiritual', 'Digital', 'Social'].map(dim => (
            <button
              key={dim}
              onClick={() => setState(s => ({ ...s, focusDimension: dim as any }))}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                state.focusDimension === dim 
                ? 'bg-accent border-accent text-black' 
                : 'bg-transparent border-white/10 text-subtext hover:border-white/30'
              }`}
            >
              {dim}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual & Interactive Column */}
        <div className="lg:col-span-4 space-y-8">
          <MentalShapeMatrix state={state} onChange={setState} />
          <LiveConversation />
          <VisualArsenal />
        </div>

        {/* Knowledge & Planning Column */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-cinzel text-xl text-accent">Spiritual Synthesis</h3>
                <div className="flex gap-2">
                  {insight && (
                    <button onClick={shareInsight} className="text-[10px] border border-white/10 px-3 py-1 rounded-lg hover:bg-white/5 transition-all">Share</button>
                  )}
                  <button 
                    onClick={fetchInsight}
                    disabled={loading}
                    className={`text-[10px] border border-accent/30 px-3 py-1 rounded-lg transition-all ${loading ? 'opacity-50 cursor-wait' : 'hover:bg-accent/10'}`}
                  >
                    {loading ? 'Synthesizing...' : 'Seek Insight'}
                  </button>
                </div>
             </div>
             {insight && (
               <div className="glass p-6 rounded-2xl border border-accent/20 bg-accent/5 animate-in fade-in duration-700">
                  <p className="italic text-lg font-cinzel text-center mb-6">"{insight.verse}"</p>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="p-3 bg-black/20 rounded-xl">
                        <span className="text-[8px] font-bold text-accent uppercase block mb-1">Deeper Insight</span>
                        <p className="text-xs italic leading-relaxed">{insight.philosophicalStatement}</p>
                     </div>
                     <div className="p-3 bg-black/20 rounded-xl">
                        <span className="text-[8px] font-bold text-accent uppercase block mb-1">Modern Framing</span>
                        <p className="text-xs leading-relaxed">{insight.modernReframing}</p>
                     </div>
                  </div>
               </div>
             )}
          </section>

          <DecisionNexus state={state} onDecision={impact => {
             setState(prev => ({
                ...prev,
                emotionLevel: Math.max(-100, Math.min(100, prev.emotionLevel + (impact.emotionLevel || 0))),
                energyVector: Math.max(0, Math.min(100, prev.energyVector + (impact.energyVector || 0)))
             }));
          }} />

          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          <SageChat />
        </div>
      </div>
    </div>
  );
};

export default App;
