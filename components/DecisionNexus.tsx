
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

  // Map decision types to Material Design 3 semantic color tokens
  const getMaterialStyle = (type: string) => {
    switch(type) {
      case 'upgrade': return {
        border: 'border-[var(--md-sys-color-primary)]',
        glow: 'shadow-[0_0_20px_rgba(208,188,255,0.15)]',
        chip: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
      };
      case 'downgrade': return {
        border: 'border-[var(--md-sys-color-error)]',
        glow: 'shadow-[0_0_20px_rgba(242,184,181,0.15)]',
        chip: 'bg-[var(--md-sys-color-error)]/20 text-[var(--md-sys-color-error)]'
      };
      default: return { // mixed
        border: 'border-[var(--md-sys-color-tertiary)]',
        glow: 'shadow-[0_0_20px_rgba(239,184,200,0.15)]',
        chip: 'bg-[var(--md-sys-color-tertiary)]/20 text-[var(--md-sys-color-tertiary)]'
      };
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {decisions.map((d, idx) => {
          const style = getMaterialStyle(d.type);
          return (
            <button
              key={idx}
              onClick={() => onDecision(d.impact)}
              className={`
                relative flex flex-col text-left p-6 
                bg-[#1c1b1f] rounded-[2rem] border-2 
                ${style.border} ${style.glow}
                transition-all duration-300 ease-out
                hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl
                active:scale-[0.98] active:shadow-inner
                group overflow-hidden
              `}
            >
              {/* Material State Layer Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="font-cinzel text-base font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                  {d.label}
                </span>
                <span className={`
                  text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest 
                  border border-white/10 ${style.chip}
                `}>
                  {d.type}
                </span>
              </div>
              
              <p className="text-[13px] text-slate-400 leading-relaxed font-light group-hover:text-slate-100 transition-colors relative z-10">
                {d.desc}
              </p>

              <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-60 transition-opacity">
                <span className="material-symbols-outlined text-sm">
                  {d.type === 'upgrade' ? 'trending_up' : d.type === 'downgrade' ? 'trending_down' : 'sync'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {canUndo && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={onUndo}
            className="
              flex items-center gap-3 px-8 py-3 
              bg-white/5 border border-white/20 
              rounded-full text-[11px] font-black uppercase tracking-[0.2em] 
              hover:bg-white/10 hover:border-white/40 
              transition-all duration-200 active:scale-90 
              text-slate-300 hover:text-white shadow-xl
            "
          >
            <span className="material-symbols-outlined text-base">undo</span>
            Revert Last Decision
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;
