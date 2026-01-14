
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
    { 
      label: 'Systemic Detachment', 
      desc: 'Disconnect from digital feedback loops to focus on internal root.',
      impact: { energyVector: -10, emotionLevel: 20 },
      type: 'upgrade'
    },
    { 
      label: 'Rapid Social Engagement', 
      desc: 'High-velocity interaction in current cultural habits.',
      impact: { energyVector: 30, emotionLevel: -10 },
      type: 'mixed'
    },
    { 
      label: 'Systemic Compliance', 
      desc: 'Aligning completely with CBDC and digital ID protocols.',
      impact: { energyVector: 15, emotionLevel: -5 },
      type: 'downgrade'
    },
    { 
      label: 'Meditative Alignment', 
      desc: 'Resonating with the Gita\'s timeless knowledge.',
      impact: { energyVector: -5, emotionLevel: 40 },
      type: 'upgrade'
    }
  ];

  const getBorderClass = (type: string) => {
    switch(type) {
      case 'upgrade': return 'border-emerald-500/50 hover:border-emerald-400 text-emerald-400';
      case 'downgrade': return 'border-rose-500/50 hover:border-rose-400 text-rose-400';
      default: return 'border-amber-500/50 hover:border-amber-400 text-amber-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((d, idx) => (
          <button
            key={idx}
            onClick={() => onDecision(d.impact)}
            className={`glass p-5 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] border group ${getBorderClass(d.type)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-cinzel text-sm group-hover:text-white transition-colors">{d.label}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                d.type === 'upgrade' ? 'bg-emerald-500/10' : 
                d.type === 'downgrade' ? 'bg-rose-500/10' : 'bg-amber-500/10'
              }`}>
                {d.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">{d.desc}</p>
          </button>
        ))}
      </div>
      {canUndo && (
        <button 
          onClick={onUndo}
          className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] hover:bg-white/10 transition-colors text-subtext flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">↺</span> Undo Last Decision
        </button>
      )}
    </div>
  );
};

export default DecisionNexus;
