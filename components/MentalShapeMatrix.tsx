
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
    if (state.emotionLevel > 30 && state.energyVector > 50) return { label: "Sattvic Clarity", desc: "Stable energy, positive outlook. High prognosis for growth.", color: COLORS.positive };
    if (state.energyVector > 70) return { label: "Rajasic Turbulence", desc: "High drive but potential for anxiety. Mindset upgrade required.", color: COLORS.accent };
    if (state.emotionLevel < -30 && state.energyVector < 40) return { label: "Tamasic Stagnation", desc: "Low energy, negative affection. Risk of deep inertia.", color: COLORS.negative };
    return { label: "Dynamic Equilibrium", desc: "Balanced state. Current local scene is adaptable.", color: COLORS.neutral };
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

    // Opacity logic based on focusDimension: Sattvic, Rajasic, and Tamasic intensity
    const getOpacity = (zone: 'Tamas' | 'Rajas' | 'Sattva') => {
      const base = 0.05;
      const highlight = 0.35;
      
      if (activeDimension === 'Spiritual') {
        if (zone === 'Sattva') return highlight;
        if (zone === 'Rajas') return base;
        return base * 0.5;
      }
      if (activeDimension === 'Material') {
        if (zone === 'Rajas') return highlight;
        return base;
      }
      if (activeDimension === 'Digital') {
        if (zone === 'Rajas') return highlight;
        if (zone === 'Tamas') return highlight * 0.4;
        return base;
      }
      if (activeDimension === 'Social') {
        if (zone === 'Tamas') return highlight;
        if (zone === 'Rajas') return highlight * 0.6;
        return base;
      }
      return base;
    };

    // Zones
    const zones = [
        { x: [-100, -20], y: [0, 40], color: COLORS.negative, label: 'Tamasic Zone', type: 'Tamas' },
        { x: [-100, 100], y: [60, 100], color: COLORS.accent, label: 'Rajasic Zone', type: 'Rajas' },
        { x: [20, 100], y: [40, 80], color: COLORS.positive, label: 'Sattvic Zone', type: 'Sattva' }
    ];

    zones.forEach(z => {
        svg.append("rect")
            .attr("x", xScale(z.x[0]))
            .attr("y", yScale(z.y[1]))
            .attr("width", xScale(z.x[1]) - xScale(z.x[0]))
            .attr("height", yScale(z.y[0]) - yScale(z.y[1]))
            .attr("fill", z.color)
            .attr("opacity", getOpacity(z.type as any))
            .attr("rx", 12);
        
        svg.append("text")
            .attr("x", xScale(z.x[0]) + 10)
            .attr("y", yScale(z.y[1]) + 20)
            .attr("fill", "white")
            .attr("opacity", 0.6)
            .attr("class", "text-[9px] font-bold uppercase tracking-wider")
            .text(z.label);
    });

    // Main Axes
    svg.append("line").attr("x1", margin).attr("y1", height/2).attr("x2", width-margin).attr("y2", height/2).attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-dasharray", "2,2");
    svg.append("line").attr("x1", width/2).attr("y1", margin).attr("x2", width/2).attr("y2", height-margin).attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-dasharray", "2,2");

    // Labels
    svg.append("text").attr("x", width-margin).attr("y", height/2-10).attr("text-anchor", "end").attr("fill", COLORS.positive).attr("class", "text-[8px] font-black uppercase tracking-tighter").text("Emotion (+)");
    svg.append("text").attr("x", margin).attr("y", height/2-10).attr("text-anchor", "start").attr("fill", COLORS.negative).attr("class", "text-[8px] font-black uppercase tracking-tighter").text("Affection (-)");

    // Current State Shape
    const area = d3.area().x(d => xScale(d[0])).y0(yScale(0)).y1(d => yScale(d[1])).curve(d3.curveBasis);
    const blobData: [number, number][] = [
        [-100, 0],
        [state.emotionLevel - 40, state.energyVector * 0.3],
        [state.emotionLevel, state.energyVector],
        [state.emotionLevel + 40, state.energyVector * 0.3],
        [100, 0]
    ];

    svg.append("path")
      .datum(blobData)
      .attr("d", area as any)
      .attr("fill", d3.interpolateRgb(COLORS.negative, COLORS.positive)((state.emotionLevel + 100)/200))
      .attr("opacity", 0.2)
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1);

    // Dynamic Vector Line
    svg.append("line")
      .attr("x1", width/2).attr("y1", height-margin)
      .attr("x2", xScale(state.emotionLevel)).attr("y2", yScale(state.energyVector))
      .attr("stroke", COLORS.accent)
      .attr("stroke-width", 2)
      .attr("opacity", 0.4)
      .attr("stroke-dasharray", "5,3");

    // Interaction Node
    const node = svg.append("g")
      .attr("transform", `translate(${xScale(state.emotionLevel)}, ${yScale(state.energyVector)})`)
      .attr("class", "cursor-grab")
      .call(d3.drag<SVGGElement, unknown>()
        .on("drag", (event) => {
          onChange({
            ...state,
            emotionLevel: xScale.invert(Math.max(margin, Math.min(width - margin, event.x))),
            energyVector: yScale.invert(Math.max(margin, Math.min(height - margin, event.y)))
          });
        })
      );

    node.append("circle").attr("r", 15).attr("fill", COLORS.accent).attr("opacity", 0.2);
    node.append("circle").attr("r", 6).attr("fill", COLORS.accent).attr("stroke", "white").attr("stroke-width", 2);

  }, [state, onChange, activeDimension]);

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h3 className="font-cinzel text-lg text-accent">Mental Shape Matrix</h3>
          <p className="text-[9px] text-subtext uppercase tracking-widest">Guna Proximity Analysis</p>
        </div>
        <select 
          value={localDimension}
          onChange={(e) => setLocalDimension(e.target.value as any)}
          className="text-[9px] bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none text-accent uppercase font-bold tracking-wider"
        >
          <option value="Default">Auto Override</option>
          <option value="Material">Material Mode</option>
          <option value="Spiritual">Spiritual Mode</option>
          <option value="Digital">Digital Mode</option>
          <option value="Social">Social Mode</option>
        </select>
      </div>
      
      <div className="relative bg-black/20 rounded-xl overflow-hidden border border-white/5 shadow-inner">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-auto mx-auto" />
      </div>

      <div className="mt-6 flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="w-4 h-4 rounded-full mt-1 shrink-0 animate-pulse" style={{ backgroundColor: prognosis.color, boxShadow: `0 0 10px ${prognosis.color}` }}></div>
        <div>
          <span className="font-cinzel text-sm block" style={{ color: prognosis.color }}>{prognosis.label}</span>
          <p className="text-xs text-subtext mt-1 leading-relaxed italic">{prognosis.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;
