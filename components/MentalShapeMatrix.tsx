import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { AlignmentState } from '../types';
import { COLORS } from '../constants';

interface Props {
  state: AlignmentState;
  onChange: (state: AlignmentState) => void;
}

const MentalShapeMatrix: React.FC<Props> = ({ state, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [localDimension, setLocalDimension] = useState<AlignmentState['focusDimension'] | 'Default'>(state.focusDimension);

  useEffect(() => {
    setLocalDimension(state.focusDimension);
  }, [state.focusDimension]);

  const activeDimension = localDimension === 'Default' ? state.focusDimension : localDimension;

  const prognosis = useMemo(() => {
    if (state.emotionLevel > 30 && state.energyVector > 50) return { label: "Sattvic Clarity", desc: "Stable energy, positive outlook. High prognosis for evolutionary growth.", color: COLORS.positive };
    if (state.energyVector > 70) return { label: "Rajasic Turbulence", desc: "High drive with potential for systemic anxiety.", color: COLORS.accent };
    if (state.emotionLevel < -30 && state.energyVector < 40) return { label: "Tamasic Stagnation", desc: "Low energy, negative affection. Risk of deep inertial entanglement.", color: COLORS.negative };
    return { label: "Dynamic Equilibrium", desc: "Balanced state. Adaptable to change.", color: COLORS.neutral };
  }, [state]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const margin = 40;

    const xScale = d3.scaleLinear().domain([-100, 100]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height - margin, margin]);

    const getZoneVisuals = (zone: 'Tamas' | 'Rajas' | 'Sattva') => {
      const baseOpacity = 0.05;
      const emphasisOpacity = 0.4;
      const dominantOpacity = 0.8;

      switch (activeDimension) {
        case 'Spiritual':
          if (zone === 'Sattva') return { opacity: dominantOpacity, glow: true };
          if (zone === 'Rajas') return { opacity: baseOpacity * 2, glow: false };
          return { opacity: baseOpacity, glow: false };
        case 'Material':
          if (zone === 'Rajas') return { opacity: dominantOpacity, glow: true };
          return { opacity: baseOpacity, glow: false };
        case 'Digital':
          if (zone === 'Rajas') return { opacity: emphasisOpacity, glow: true };
          if (zone === 'Tamas') return { opacity: emphasisOpacity * 0.5, glow: false };
          return { opacity: baseOpacity, glow: false };
        case 'Social':
          if (zone === 'Tamas') return { opacity: dominantOpacity, glow: true };
          if (zone === 'Rajas') return { opacity: emphasisOpacity, glow: false };
          return { opacity: baseOpacity, glow: false };
        default:
          return { opacity: 0.1, glow: false };
      }
    };

    const zones = [
      { x: [-100, -20], y: [0, 40], color: COLORS.negative, label: 'Tamasic', type: 'Tamas' },
      { x: [-100, 100], y: [60, 100], color: COLORS.accent, label: 'Rajasic', type: 'Rajas' },
      { x: [20, 100], y: [40, 80], color: COLORS.positive, label: 'Sattvic', type: 'Sattva' }
    ];

    zones.forEach(z => {
      const visuals = getZoneVisuals(z.type as any);
      
      const rect = svg.append("rect")
        .attr("x", xScale(z.x[0]))
        .attr("y", yScale(z.y[1]))
        .attr("width", xScale(z.x[1]) - xScale(z.x[0]))
        .attr("height", yScale(z.y[0]) - yScale(z.y[1]))
        .attr("fill", z.color)
        .attr("opacity", visuals.opacity)
        .attr("rx", 20)
        .attr("class", "transition-all duration-700");

      if (visuals.glow) {
        rect.attr("filter", "url(#matrixGlow)");
      }

      svg.append("text")
        .attr("x", xScale(z.x[0]) + 10)
        .attr("y", yScale(z.y[1]) + 20)
        .attr("fill", "white")
        .attr("opacity", visuals.glow ? 1 : 0.3)
        .attr("class", "text-[9px] font-black uppercase tracking-widest")
        .text(z.label);
    });

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "matrixGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const axisColor = "rgba(255,255,255,0.05)";
    svg.append("line").attr("x1", margin).attr("y1", height/2).attr("x2", width-margin).attr("y2", height/2).attr("stroke", axisColor);
    svg.append("line").attr("x1", width/2).attr("y1", margin).attr("x2", width/2).attr("y2", height-margin).attr("stroke", axisColor);

    svg.append("circle")
      .attr("cx", xScale(state.emotionLevel))
      .attr("cy", yScale(state.energyVector))
      .attr("r", 8)
      .attr("fill", COLORS.accent)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("filter", "url(#matrixGlow)");

  }, [state, activeDimension]);

  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 bg-black/60 shadow-2xl transition-all animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-cinzel text-2xl text-accent tracking-widest">Mental Matrix</h3>
          <p className="text-[10px] text-subtext uppercase tracking-[0.3em] font-black opacity-40">Systemic Resonance</p>
        </div>
        <select 
          value={localDimension}
          onChange={(e) => setLocalDimension(e.target.value as any)}
          className="text-[10px] bg-black/40 border border-white/10 rounded-full px-4 py-2 text-accent uppercase font-black"
        >
          <option value="Default">Auto: {state.focusDimension}</option>
          <option value="Material">Material</option>
          <option value="Spiritual">Spiritual</option>
          <option value="Digital">Digital</option>
          <option value="Social">Social</option>
        </select>
      </div>
      
      <div className="relative bg-[#050505] rounded-[2rem] overflow-hidden border border-white/5">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-auto mx-auto" />
      </div>

      <div className="mt-8 flex items-start gap-6 p-6 bg-white/[0.03] rounded-[2rem] border border-white/5">
        <div className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ backgroundColor: prognosis.color }}></div>
        <div>
          <span className="font-cinzel text-lg block font-bold" style={{ color: prognosis.color }}>{prognosis.label}</span>
          <p className="text-sm text-slate-400 mt-2 italic font-light">{prognosis.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;