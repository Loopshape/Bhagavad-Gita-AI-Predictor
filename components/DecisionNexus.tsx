import React from 'react';
import { AlignmentState } from '../types';

interface Props {
  state: AlignmentState;
  onDecision: (impact: Partial<AlignmentState>) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const DecisionNexus: React.FC<Props> = ({ state, onUndo, onDecision, canUndo }) => {
  const decisions = [
    { 
      label: 'Detachment', 
      desc: 'Focus on internal root and spiritual resonance. Shed digital weight.', 
      impact: { energyVector: -10, emotionLevel: 20 }, 
      type: 'upgrade' 
    },
    { 
      label: 'Engagement', 
      desc: 'High-velocity interaction with social digital hubs. Dynamic flow.', 
      impact: { energyVector: 30, emotionLevel: -10 }, 
      type: 'mixed' 
    },
    { 
      label: 'Compliance', 
      desc: 'Alignment with standard systemic frameworks. Pattern adherence.', 
      impact: { energyVector: 15, emotionLevel: -5 }, 
      type: 'downgrade' 
    },
    { 
      label: 'Meditation', 
      desc: 'Absorption in timeless Vedic knowledge. Deep samadhi focus.', 
      impact: { energyVector: -5, emotionLevel: 40 }, 
      type: 'upgrade' 
    }
  ];

  const getGlowClass = (type: string) => {
    switch(type) {
      case 'upgrade': return 'glow-upgrade border-neon-green/30';
      case 'downgrade': return 'glow-downgrade border-neon-red/30';
      default: return 'glow-mixed border-neon-blue/30';
    }
  };

  const getSemanticColor = (type: string) => {
    switch(type) {
      case 'upgrade': return 'var(--neon-green)';
      case 'downgrade': return 'var(--neon-red)';
      default: return 'var(--neon-blue)';
    }
  };

  return (
    <div className="space-y-12 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {decisions.map((d, idx) => {
          const semanticColor = getSemanticColor(d.type);
          return (
            <button
              key={idx}
              onClick={() => onDecision(d.impact)}
              className={`
                m3-elevated-button flex flex-col text-left p-8 
                ${getGlowClass(d.type)} w-full bg-black/40 group
              `}
            >
              <div className="flex justify-between items-center mb-6 w-full">
                <span className="font-cinzel text-2xl font-black text-white group-hover:text-neon-white transition-colors">{d.label}</span>
                <span 
                  style={{ color: semanticColor, borderColor: semanticColor }}
                  className="text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] bg-black/60 border opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
                >
                  {d.type}
                </span>
              </div>
              <p className="text-lg text-slate-400 font-light leading-relaxed group-hover:text-slate-100 transition-colors">{d.desc}</p>
            </button>
          );
        })}
      </div>
      
      {canUndo && (
        <div className="flex justify-center w-full pt-6">
          <button 
            onClick={onUndo} 
            className="
              flex items-center gap-4 px-12 py-4 
              bg-white/5 border border-white/10 rounded-full 
              text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 
              hover:text-neon-magenta hover:bg-white/10 hover:border-neon-magenta/50
              hover:shadow-[0_0_20px_rgba(255,0,255,0.2)]
              transition-all active:scale-95 group
            "
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">undo</span>
            Revert Temporal State
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionNexus;