
import React, { useState, useEffect } from 'react';
import { UserProfile, AlignmentState, GitaInsight, YearlyDedication } from './types';
import MentalShapeMatrix from './components/MentalShapeMatrix';
import DecisionNexus from './components/DecisionNexus';
import { generateGitaInsight, generateYearlyDedication } from './services/geminiService';
import { COLORS } from './constants';

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
        <div key={idx} className="glass p-5 rounded-xl border-l-4 border-accent">
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
        console.error("Yearly plan failed", e);
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
      console.error("Insight failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (impact: Partial<AlignmentState>) => {
    setState(prev => ({
      ...prev,
      emotionLevel: Math.max(-100, Math.min(100, prev.emotionLevel + (impact.emotionLevel || 0))),
      energyVector: Math.max(0, Math.min(100, prev.energyVector + (impact.energyVector || 0)))
    }));
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              value={tempProfile.name}
              onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
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
          <h2 className="font-cinzel text-2xl text-accent">{profile.name}'s Dedication Matrix</h2>
          <p className="text-xs text-subtext uppercase tracking-widest">Born: {profile.birthDate} | Alignment Status: Active</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-[10px] text-subtext uppercase">Guna State</div>
            <div className="text-sm font-bold text-accent">BALANCED</div>
          </div>
          <div className="text-center border-l border-white/10 pl-6">
            <div className="text-[10px] text-subtext uppercase">Prognose Vector</div>
            <div className="text-sm font-bold text-green-500">{state.energyVector.toFixed(0)}% OPR</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Visualization & Decisions */}
        <div className="lg:col-span-4 space-y-8">
          <MentalShapeMatrix state={state} onChange={setState} />
          <section className="space-y-4">
            <h3 className="font-cinzel text-lg text-accent">Elemental Decisions</h3>
            <DecisionNexus state={state} onDecision={handleDecision} />
          </section>
        </div>

        {/* Right: Insights & Yearly Plan */}
        <div className="lg:col-span-8 space-y-8">
          {yearlyPlan && <YearlyRoadmap plan={yearlyPlan} />}
          
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-cinzel text-xl text-accent">Spiritual Synthesis</h3>
              <button 
                onClick={fetchInsight}
                disabled={loading}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/20 px-4 py-2 rounded-lg transition-all"
              >
                {loading ? 'Syncing...' : 'Seek Deeper Insight'}
              </button>
            </div>

            {insight && (
              <div className="glass p-8 rounded-3xl border border-accent/20 relative group">
                <div className="space-y-6">
                  <div className="italic text-lg text-accent font-cinzel leading-relaxed text-center">
                    "{insight.verse}"
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-subtext mb-2">PHILOSOPHICAL STATEMENT</h4>
                      <p className="text-xs leading-relaxed text-slate-300 italic">{insight.philosophicalStatement}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-subtext mb-2">MODERN PSYCHOLOGICAL FRAMING</h4>
                      <p className="text-xs leading-relaxed text-accent/80">{insight.modernReframing}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
