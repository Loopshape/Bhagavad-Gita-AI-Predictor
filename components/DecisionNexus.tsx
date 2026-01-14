
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

  const getStyle = (type: string) => {
    switch(type) {
      case 'upgrade': return {
        border: 'border-[var(--md-sys-color-primary)]',
        glow: 'hover:shadow-[0_0_20px_rgba(208,188,255,0.4)]',
        bg: 'bg-[var(--md-sys-color-primary-container)]/10'
      };
      case 'downgrade': return {
        border: 'border-[var(--md-sys-color-error)]',
        glow: 'hover:shadow-[0_0_20px_rgba(242,184,181,0.4)]',
        bg: 'bg-[var(--md-sys-color-error)]/10'
      };
      default: return { // mixed
        border: 'border-[var(--md-sys-color-tertiary)]',
        glow: 'hover:shadow-[0_0_20px_rgba(239,184,200,0.4)]',
        bg: 'bg-[var(--md-sys-color-tertiary-container)]/10'
      };
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((d, idx) => {
          const style = getStyle(d.type);
          return (
            <button
              key={idx}
              onClick={() => onDecision(d.impact)}
              className={`
                relative flex flex-col text-left p-6 
                bg-[#1c1b1f] rounded-[2rem] border-2 transition-all duration-300
                hover:scale-[1.03] active:scale-[0.98] group overflow-hidden
                ${style.border} ${style.glow} ${style.bg}
              `}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-cinzel text-base font-bold tracking-tight text-white group-hover:text-accent">
                  {d.label}
                </span>
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-black/40 text-white/70 border border-white/10`}>
                  {d.type}
                </span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed font-light group-hover:text-white transition-colors relative z-10">
                {d.desc}
              </p>
            </button>
          );
        })}
      </div>
      
      {canUndo && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={onUndo}
            className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">undo</span>
            Undo Last Decision
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;
