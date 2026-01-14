
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

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'upgrade': return 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10';
      case 'downgrade': return 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10';
      default: return 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((d, idx) => (
          <button
            key={idx}
            onClick={() => onDecision(d.impact)}
            className={`m3-card text-left border transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] group ${getTypeStyle(d.type)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="font-cinzel text-sm font-bold tracking-tight group-hover:text-white">{d.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                d.type === 'upgrade' ? 'bg-emerald-500/20' : 
                d.type === 'downgrade' ? 'bg-rose-500/20' : 'bg-amber-500/20'
              }`}>
                {d.type}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors font-light">{d.desc}</p>
          </button>
        ))}
      </div>
      
      {canUndo && (
        <div className="flex justify-center">
          <md-outlined-button onClick={onUndo} style={{ '--md-outlined-button-outline-color': 'rgba(255,255,255,0.2)' }}>
            <span slot="icon" className="material-symbols-outlined">undo</span>
            Undo Last Decision
          </md-outlined-button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;
