
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

  // Map decision types to Material Design 3 semantic color tokens with intensified hover glow
  const getMaterialStyle = (type: string) => {
    switch(type) {
      case 'upgrade': return {
        border: 'border-[var(--md-sys-color-primary)]',
        glow: 'shadow-[0_0_15px_rgba(208,188,255,0.1)]',
        hoverGlow: 'hover:shadow-[0_0_35px_rgba(208,188,255,0.4)]',
        chip: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
      };
      case 'downgrade': return {
        border: 'border-[var(--md-sys-color-error)]',
        glow: 'shadow-[0_0_15px_rgba(242,184,181,0.1)]',
        hoverGlow: 'hover:shadow-[0_0_35px_rgba(242,184,181,0.4)]',
        chip: 'bg-[var(--md-sys-color-error)]/20 text-[var(--md-sys-color-error)]'
      };
      default: return { // mixed
        border: 'border-[var(--md-sys-color-tertiary)]',
        glow: 'shadow-[0_0_15px_rgba(239,184,200,0.1)]',
        hoverGlow: 'hover:shadow-[0_0_35px_rgba(239,184,200,0.4)]',
        chip: 'bg-[var(--md-sys-color-tertiary)]/20 text-[var(--md-sys-color-tertiary)]'
      };
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {decisions.map((d, idx) => {
          const style = getMaterialStyle(d.type);
          return (
            <button
              key={idx}
              onClick={() => onDecision(d.impact)}
              className={`
                relative flex flex-col text-left p-8 
                bg-[#1c1b1f] rounded-[2.5rem] border-2 
                ${style.border} ${style.glow} ${style.hoverGlow}
                transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                hover:scale-[1.04] hover:-translate-y-2
                active:scale-[0.96] active:shadow-inner
                group overflow-hidden
              `}
            >
              {/* Material State Layer Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="font-cinzel text-lg font-bold tracking-tight text-white group-hover:text-accent transition-colors duration-300">
                  {d.label}
                </span>
                <span className={`
                  text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest 
                  border border-white/10 ${style.chip} shadow-sm
                `}>
                  {d.type}
                </span>
              </div>
              
              <p className="text-[14px] text-slate-400 leading-relaxed font-light group-hover:text-slate-100 transition-colors duration-300 relative z-10">
                {d.desc}
              </p>

              <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/5 p-2 rounded-full border border-white/10">
                  <span className="material-symbols-outlined text-base text-accent">
                    {d.type === 'upgrade' ? 'trending_up' : d.type === 'downgrade' ? 'trending_down' : 'sync'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {canUndo && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onUndo}
            className="
              flex items-center gap-4 px-10 py-4 
              bg-white/5 border border-white/10 
              rounded-full text-[12px] font-black uppercase tracking-[0.3em] 
              hover:bg-white/10 hover:border-white/30 
              transition-all duration-300 active:scale-90 
              text-slate-400 hover:text-white shadow-2xl
              group
            "
          >
            <span className="material-symbols-outlined text-lg group-hover:-rotate-90 transition-transform">undo</span>
            Revert Last Decision
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;
