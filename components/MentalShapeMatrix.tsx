
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
    if (state.energyVector > 70) return { label: "Rajasic Turbulence", desc: "High drive with potential for systemic anxiety. Immediate mindset upgrade recommended.", color: COLORS.accent };
    if (state.emotionLevel < -30 && state.energyVector < 40) return { label: "Tamasic Stagnation", desc: "Low energy, negative affection. Risk of deep inertial entanglement.", color: COLORS.negative };
    return { label: "Dynamic Equilibrium", desc: "Balanced state. Local scene is currently adaptable to change.", color: COLORS.neutral };
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

    // Opacity logic based on focusDimension: Visual emphasizing of Energetic Zones
    const getZoneOpacity = (zone: 'Tamas' | 'Rajas' | 'Sattva') => {
      const base = 0.05;
      const highlight = 0.45;
      
      if (activeDimension === 'Spiritual') {
        if (zone === 'Sattva') return highlight;
        if (zone === 'Rajas') return base * 2.5;
        return base;
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
            .attr("opacity", getZoneOpacity(z.type as any))
            .attr("rx", 16);
        
        svg.append("text")
            .attr("x", xScale(z.x[0]) + 12)
            .attr("y", yScale(z.y[1]) + 24)
            .attr("fill", "white")
            .attr("opacity", 0.7)
            .attr("class", "text-[10px] font-black uppercase tracking-widest")
            .text(z.label);
    });

    // Crosshairs
    svg.append("line").attr("x1", margin).attr("y1", height/2).attr("x2", width-margin).attr("y2", height/2).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-dasharray", "4,4");
    svg.append("line").attr("x1", width/2).attr("y1", margin).attr("x2", width/2).attr("y2", height-margin).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-dasharray", "4,4");

    // Axis Labels
    svg.append("text").attr("x", width-margin).attr("y", height/2-18).attr("text-anchor", "end").attr("fill", COLORS.positive).attr("class", "text-[10px] font-black uppercase tracking-tighter shadow-md").text("Emotion (+)");
    svg.append("text").attr("x", margin).attr("y", height/2-18).attr("text-anchor", "start").attr("fill", COLORS.negative).attr("class", "text-[10px] font-black uppercase tracking-tighter shadow-md").text("Affection (-)");

    // Resonance Area (The "Shape")
    const area = d3.area().x(d => xScale(d[0])).y0(yScale(0)).y1(d => yScale(d[1])).curve(d3.curveBasis);
    const blobData: [number, number][] = [
        [-100, 0],
        [state.emotionLevel - 50, state.energyVector * 0.3],
        [state.emotionLevel, state.energyVector],
        [state.emotionLevel + 50, state.energyVector * 0.3],
        [100, 0]
    ];

    svg.append("path")
      .datum(blobData)
      .attr("d", area as any)
      .attr("fill", d3.interpolateRgb(COLORS.negative, COLORS.positive)((state.emotionLevel + 100)/200))
      .attr("opacity", 0.3)
      .attr("stroke", "rgba(255,255,255,0.4)")
      .attr("stroke-width", 2);

    // Vector Trace
    svg.append("line")
      .attr("x1", width/2).attr("y1", height-margin)
      .attr("x2", xScale(state.emotionLevel)).attr("y2", yScale(state.energyVector))
      .attr("stroke", COLORS.accent)
      .attr("stroke-width", 3)
      .attr("opacity", 0.6)
      .attr("stroke-dasharray", "8,4");

    // Interactive Core Node
    const node = svg.append("g")
      .attr("transform", `translate(${xScale(state.emotionLevel)}, ${yScale(state.energyVector)})`)
      .attr("class", "cursor-grab active:cursor-grabbing")
      .call(d3.drag<SVGGElement, unknown>()
        .on("drag", (event) => {
          onChange({
            ...state,
            emotionLevel: xScale.invert(Math.max(margin, Math.min(width - margin, event.x))),
            energyVector: yScale.invert(Math.max(margin, Math.min(height - margin, event.y)))
          });
        })
      );

    node.append("circle").attr("r", 20).attr("fill", COLORS.accent).attr("opacity", 0.2);
    node.append("circle").attr("r", 8).attr("fill", COLORS.accent).attr("stroke", "white").attr("stroke-width", 3).attr("class", "shadow-xl");

  }, [state, onChange, activeDimension]);

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden shadow-2xl border border-white/10">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="font-cinzel text-xl text-accent tracking-wider">Mental Matrix</h3>
          <p className="text-[10px] text-subtext uppercase tracking-[0.2em] font-black opacity-60">Guna Influence Vector</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <label className="text-[8px] uppercase font-black tracking-widest text-subtext opacity-50">Local Override</label>
          <select 
            value={localDimension}
            onChange={(e) => setLocalDimension(e.target.value as any)}
            className="text-[9px] bg-black/60 border border-white/10 rounded-xl px-4 py-2 focus:outline-none text-accent uppercase font-black tracking-widest transition-all hover:bg-white/10"
          >
            <option value="Default">Global: {state.focusDimension}</option>
            <option value="Material">Material Mode</option>
            <option value="Spiritual">Spiritual Mode</option>
            <option value="Digital">Digital Mode</option>
            <option value="Social">Social Mode</option>
          </select>
        </div>
      </div>
      
      <div className="relative bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-auto mx-auto drop-shadow-2xl" />
      </div>

      <div className="mt-8 flex items-start gap-5 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-lg group transition-all hover:border-accent/30 bg-gradient-to-r from-transparent to-white/5">
        <div className="w-5 h-5 rounded-full mt-1.5 shrink-0 animate-pulse shadow-[0_0_15px_currentColor]" style={{ backgroundColor: prognosis.color, color: prognosis.color }}></div>
        <div>
          <span className="font-cinzel text-base block font-bold" style={{ color: prognosis.color }}>{prognosis.label}</span>
          <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed italic font-light">{prognosis.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;
