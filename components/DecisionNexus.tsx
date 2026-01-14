
import React from 'react';
import { AlignmentState } from '../types';

interface Props {
  state: AlignmentState;
  onDecision: (impact: Partial<AlignmentState>) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const DecisionNexus: React.FC<Props> = ({ state, onDecision, onUndo, canUndo }) => {
  const decisions = [
    { label: 'Detachment', desc: 'Focus on internal root.', impact: { energyVector: -10, emotionLevel: 20 }, type: 'upgrade' },
    { label: 'Engagement', desc: 'High-velocity interaction.', impact: { energyVector: 30, emotionLevel: -10 }, type: 'mixed' },
    { label: 'Compliance', desc: 'Systemic alignment.', impact: { energyVector: 15, emotionLevel: -5 }, type: 'downgrade' },
    { label: 'Meditation', desc: 'Timeless knowledge.', impact: { energyVector: -5, emotionLevel: 40 }, type: 'upgrade' }
  ];

  const getTheme = (type: string) => {
    switch(type) {
      case 'upgrade': return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60';
      case 'downgrade': return 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60';
      default: return 'border-accent/30 bg-accent/5 hover:border-accent/60';
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {decisions.map((d, idx) => (
          <button
            key={idx}
            onClick={() => onDecision(d.impact)}
            className={`flex flex-col text-left p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full ${getTheme(d.type)}`}
          >
            <div className="flex justify-between items-center mb-2 w-full">
              <span className="font-cinzel text-lg font-bold text-white">{d.label}</span>
              <span className="text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-black/40 border border-white/10 opacity-60">{d.type}</span>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">{d.desc}</p>
          </button>
        ))}
      </div>
      
      {canUndo && (
        <div className="flex justify-center w-full">
          <button onClick={onUndo} className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all">
            <span className="material-symbols-outlined text-sm">undo</span>
            Undo Sequence
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;
