
import React from 'react';
import { AlignmentState } from '../types';

interface Props {
  state: AlignmentState;
  onDecision: (impact: Partial<AlignmentState>) => void;
}

const DecisionNexus: React.FC<Props> = ({ state, onDecision }) => {
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

  const getBorderColor = (type: string) => {
    if (type === 'upgrade') return 'border-emerald-500/50 hover:border-emerald-400';
    if (type === 'downgrade') return 'border-rose-500/50 hover:border-rose-400';
    return 'border-amber-500/50 hover:border-amber-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {decisions.map((d, idx) => (
        <button
          key={idx}
          onClick={() => onDecision(d.impact)}
          className={`glass p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] border group ${getBorderColor(d.type)}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-cinzel text-sm text-accent group-hover:text-white transition-colors">{d.label}</span>
            <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
              d.type === 'upgrade' ? 'bg-emerald-500/10 text-emerald-500' : 
              d.type === 'downgrade' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {d.type}
            </span>
          </div>
          <p className="text-[11px] text-subtext leading-relaxed group-hover:text-slate-200 transition-colors">{d.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default DecisionNexus;
