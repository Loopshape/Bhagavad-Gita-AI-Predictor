
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

    /**
     * Zone Highlighting Logic:
     * Adjusts color intensity and transparency based on the focusDimension.
     */
    const getZoneVisuals = (zone: 'Tamas' | 'Rajas' | 'Sattva') => {
      const baseOpacity = 0.04;
      const highlightOpacity = 0.35;
      const intenseOpacity = 0.55;

      switch (activeDimension) {
        case 'Spiritual':
          if (zone === 'Sattva') return { opacity: intenseOpacity, glow: true };
          if (zone === 'Rajas') return { opacity: baseOpacity * 2, glow: false };
          return { opacity: baseOpacity, glow: false };
        case 'Material':
          if (zone === 'Rajas') return { opacity: intenseOpacity, glow: true };
          return { opacity: baseOpacity, glow: false };
        case 'Digital':
          if (zone === 'Rajas') return { opacity: highlightOpacity, glow: true };
          if (zone === 'Tamas') return { opacity: highlightOpacity * 0.5, glow: false };
          return { opacity: baseOpacity, glow: false };
        case 'Social':
          if (zone === 'Tamas') return { opacity: intenseOpacity, glow: true };
          if (zone === 'Rajas') return { opacity: highlightOpacity * 0.7, glow: false };
          return { opacity: baseOpacity, glow: false };
        default:
          return { opacity: baseOpacity, glow: false };
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
        .attr("rx", 16)
        .attr("class", "transition-opacity duration-700");

      if (visuals.glow) {
        rect.attr("filter", "url(#glow)");
      }

      svg.append("text")
        .attr("x", xScale(z.x[0]) + 12)
        .attr("y", yScale(z.y[1]) + 24)
        .attr("fill", "white")
        .attr("opacity", visuals.glow ? 0.9 : 0.3)
        .attr("class", `text-[10px] font-black uppercase tracking-widest ${visuals.glow ? 'animate-pulse' : ''}`)
        .text(z.label);
    });

    // Filters for glow effect
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Grid / Crosshairs
    svg.append("line").attr("x1", margin).attr("y1", height/2).attr("x2", width-margin).attr("y2", height/2).attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-dasharray", "2,4");
    svg.append("line").attr("x1", width/2).attr("y1", margin).attr("x2", width/2).attr("y2", height-margin).attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-dasharray", "2,4");

    // Interaction Line (Vector Trace)
    svg.append("line")
      .attr("x1", width/2).attr("y1", height-margin)
      .attr("x2", xScale(state.emotionLevel)).attr("y2", yScale(state.energyVector))
      .attr("stroke", COLORS.accent)
      .attr("stroke-width", 2)
      .attr("opacity", 0.4)
      .attr("stroke-dasharray", "5,5");

    // Resonance Area
    const area = d3.area().x(d => xScale(d[0])).y0(yScale(0)).y1(d => yScale(d[1])).curve(d3.curveBasis);
    const blobData: [number, number][] = [
      [-100, 0],
      [state.emotionLevel - 40, state.energyVector * 0.4],
      [state.emotionLevel, state.energyVector],
      [state.emotionLevel + 40, state.energyVector * 0.4],
      [100, 0]
    ];

    svg.append("path")
      .datum(blobData)
      .attr("d", area as any)
      .attr("fill", d3.interpolateRgb(COLORS.negative, COLORS.positive)((state.emotionLevel + 100)/200))
      .attr("opacity", 0.25)
      .attr("stroke", "rgba(255,255,255,0.3)")
      .attr("stroke-width", 1.5);

    // Draggable Core Node
    const node = svg.append("g")
      .attr("transform", `translate(${xScale(state.emotionLevel)}, ${yScale(state.energyVector)})`)
      .attr("class", "cursor-move")
      .call(d3.drag<SVGGElement, unknown>()
        .on("drag", (event) => {
          onChange({
            ...state,
            emotionLevel: xScale.invert(Math.max(margin, Math.min(width - margin, event.x))),
            energyVector: yScale.invert(Math.max(margin, Math.min(height - margin, event.y)))
          });
        })
      );

    node.append("circle").attr("r", 25).attr("fill", COLORS.accent).attr("opacity", 0.1);
    node.append("circle").attr("r", 9).attr("fill", COLORS.accent).attr("stroke", "white").attr("stroke-width", 2.5).attr("class", "shadow-xl");

  }, [state, onChange, activeDimension]);

  return (
    <div className="glass p-6 rounded-[2rem] relative overflow-hidden shadow-2xl border border-white/5 bg-black/40">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="font-cinzel text-xl text-accent tracking-wider">Mental Matrix</h3>
          <p className="text-[10px] text-subtext uppercase tracking-[0.2em] font-black opacity-60">Guna Influence Intensity</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <label className="text-[9px] uppercase font-black tracking-widest text-subtext opacity-40">Local Filter Override</label>
          <select 
            value={localDimension}
            onChange={(e) => setLocalDimension(e.target.value as any)}
            className="text-[10px] bg-[#1c1b1f] border border-white/10 rounded-xl px-4 py-2 focus:outline-none text-accent uppercase font-black tracking-widest transition-all hover:bg-white/5 cursor-pointer"
          >
            <option value="Default">Global Context</option>
            <option value="Material">Material Plane</option>
            <option value="Spiritual">Spiritual Plane</option>
            <option value="Digital">Digital Realm</option>
            <option value="Social">Social Sphere</option>
          </select>
        </div>
      </div>
      
      <div className="relative bg-[#0a0a0c]/80 rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-auto mx-auto drop-shadow-2xl" />
      </div>

      <div className="mt-8 flex items-start gap-4 p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 shadow-lg">
        <div className="w-4 h-4 rounded-full mt-1.5 shrink-0 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: prognosis.color, color: prognosis.color }}></div>
        <div>
          <span className="font-cinzel text-sm block font-bold" style={{ color: prognosis.color }}>{prognosis.label}</span>
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed font-light italic">
            {prognosis.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;
