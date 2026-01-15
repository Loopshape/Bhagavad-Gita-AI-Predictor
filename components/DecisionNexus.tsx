
import React from 'react';
import { AlignmentState } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  state: AlignmentState;
  onDecision: (impact: Partial<AlignmentState>) => void;
}

const DecisionNexus: React.FC<Props> = ({ state, onDecision }) => {
  const ACTIONS = [
    { label: 'Shed Attachment', impact: { emotionLevel: 20, energyVector: -10 }, type: 'Sattva' },
    { label: 'Intense Effort', impact: { emotionLevel: -5, energyVector: 30 }, type: 'Rajas' },
    { label: 'Silent Observation', impact: { emotionLevel: 10, energyVector: -20 }, type: 'Sattva' },
    { label: 'Worldly Pursuit', impact: { emotionLevel: -15, energyVector: 15 }, type: 'Rajas' }
  ];

  const handleAction = (a: any) => {
    soundService.playClick();
    soundService.triggerHaptic(20);
    onDecision(a.impact);
  };

  return (
    <div className="glass-panel p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-cinzel text-[#00f2ff] text-xl tracking-[0.3em] uppercase">Decision Nexus</h3>
        <span className="material-symbols-outlined text-white/20">psychology_alt</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((a, i) => (
          <button
            key={i}
            onClick={() => handleAction(a)}
            className="flex flex-col text-left p-6 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff00ff]/30 hover:bg-white/10 transition-all group"
          >
            <span className="text-[9px] font-code text-white/20 uppercase tracking-widest mb-2 group-hover:text-[#ff00ff]">{a.type} Node</span>
            <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{a.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-8 flex items-center justify-center p-4 bg-black/20 rounded-xl border border-white/5">
        <div className="text-[10px] font-code text-white/30 uppercase tracking-[0.5em] flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            System Ready for Input
        </div>
      </div>
    </div>
  );
};

export default DecisionNexus;
