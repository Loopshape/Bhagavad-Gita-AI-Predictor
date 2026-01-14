
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {decisions.map((d, idx) => (
        <button
          key={idx}
          onClick={() => onDecision(d.impact)}
          className="glass p-4 rounded-xl text-left hover:border-accent transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-cinzel text-sm text-accent group-hover:text-white">{d.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${
              d.type === 'upgrade' ? 'border-green-500 text-green-500' : 
              d.type === 'downgrade' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
            }`}>
              {d.type.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-subtext leading-relaxed">{d.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default DecisionNexus;
