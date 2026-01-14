
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
     * Enhanced Zone Visuals:
     * Significantly emphasizes the dimension-relevant Guna zone through higher saturation and opacity.
     */
    const getZoneVisuals = (zone: 'Tamas' | 'Rajas' | 'Sattva') => {
      const baseOpacity = 0.03;
      const emphasisOpacity = 0.45;
      const dominantOpacity = 0.7;

      switch (activeDimension) {
        case 'Spiritual':
          if (zone === 'Sattva') return { opacity: dominantOpacity, glow: true, sat: 1.5 };
          if (zone === 'Rajas') return { opacity: baseOpacity * 4, glow: false, sat: 1 };
          return { opacity: baseOpacity, glow: false, sat: 1 };
        case 'Material':
          if (zone === 'Rajas') return { opacity: dominantOpacity, glow: true, sat: 1.5 };
          return { opacity: baseOpacity, glow: false, sat: 1 };
        case 'Digital':
          if (zone === 'Rajas') return { opacity: emphasisOpacity, glow: true, sat: 1.2 };
          if (zone === 'Tamas') return { opacity: emphasisOpacity * 0.6, glow: false, sat: 1.1 };
          return { opacity: baseOpacity, glow: false, sat: 1 };
        case 'Social':
          if (zone === 'Tamas') return { opacity: dominantOpacity, glow: true, sat: 1.5 };
          if (zone === 'Rajas') return { opacity: emphasisOpacity * 0.8, glow: false, sat: 1.1 };
          return { opacity: baseOpacity, glow: false, sat: 1 };
        default:
          return { opacity: baseOpacity, glow: false, sat: 1 };
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
        .attr("class", "transition-all duration-1000 ease-in-out");

      if (visuals.glow) {
        rect.attr("filter", "url(#matrixGlow)");
      }

      svg.append("text")
        .attr("x", xScale(z.x[0]) + 16)
        .attr("y", yScale(z.y[1]) + 28)
        .attr("fill", "white")
        .attr("opacity", visuals.glow ? 1 : 0.2)
        .attr("class", `text-[11px] font-black uppercase tracking-[0.2em] transition-opacity duration-1000 ${visuals.glow ? 'animate-pulse' : ''}`)
        .text(z.label);
    });

    // Filters for advanced glow
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "matrixGlow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4.5").attr("result", "blur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Dynamic Axis Labels
    const axisColor = "rgba(255,255,255,0.1)";
    svg.append("line").attr("x1", margin).attr("y1", height/2).attr("x2", width-margin).attr("y2", height/2).attr("stroke", axisColor).attr("stroke-dasharray", "3,6");
    svg.append("line").attr("x1", width/2).attr("y1", margin).attr("x2", width/2).attr("y2", height-margin).attr("stroke", axisColor).attr("stroke-dasharray", "3,6");

    // Vector Trace with Gradient Path
    const vectorGradient = defs.append("linearGradient").attr("id", "vectorGradient").attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");
    vectorGradient.append("stop").attr("offset", "0%").attr("stop-color", "transparent");
    vectorGradient.append("stop").attr("offset", "100%").attr("stop-color", COLORS.accent).attr("stop-opacity", 0.5);

    svg.append("line")
      .attr("x1", width/2).attr("y1", height-margin)
      .attr("x2", xScale(state.emotionLevel)).attr("y2", yScale(state.energyVector))
      .attr("stroke", "url(#vectorGradient)")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "6,6")
      .attr("class", "animate-dash");

    // Resonance Blob
    const area = d3.area().x(d => xScale(d[0])).y0(yScale(0)).y1(d => yScale(d[1])).curve(d3.curveBasis);
    const blobData: [number, number][] = [
      [-100, 0],
      [state.emotionLevel - 45, state.energyVector * 0.35],
      [state.emotionLevel, state.energyVector],
      [state.emotionLevel + 45, state.energyVector * 0.35],
      [100, 0]
    ];

    svg.append("path")
      .datum(blobData)
      .attr("d", area as any)
      .attr("fill", d3.interpolateRgb(COLORS.negative, COLORS.positive)((state.emotionLevel + 100)/200))
      .attr("opacity", 0.15)
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-width", 1);

    // Draggable Core Identity Node
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

    node.append("circle").attr("r", 30).attr("fill", COLORS.accent).attr("opacity", 0.08).attr("class", "animate-pulse");
    node.append("circle").attr("r", 10).attr("fill", COLORS.accent).attr("stroke", "white").attr("stroke-width", 3).attr("class", "shadow-2xl");

  }, [state, onChange, activeDimension]);

  return (
    <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-white/5 bg-black/60 transition-all duration-700">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="font-cinzel text-2xl text-accent tracking-widest">Mental Matrix</h3>
          <p className="text-[11px] text-subtext uppercase tracking-[0.3em] font-black opacity-40">Systemic Guna Resonance</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <label className="text-[9px] uppercase font-black tracking-widest text-subtext opacity-30">Vedic Plane Focus</label>
          <select 
            value={localDimension}
            onChange={(e) => setLocalDimension(e.target.value as any)}
            className="text-[11px] bg-[#1c1b1f] border border-white/5 rounded-2xl px-5 py-2.5 focus:outline-none text-accent uppercase font-black tracking-widest transition-all hover:bg-white/5 cursor-pointer shadow-lg"
          >
            <option value="Default">Global Context</option>
            <option value="Material">Material</option>
            <option value="Spiritual">Spiritual</option>
            <option value="Digital">Digital</option>
            <option value="Social">Social</option>
          </select>
        </div>
      </div>
      
      <div className="relative bg-[#050505]/90 rounded-[2rem] overflow-hidden border border-white/5 shadow-inner p-2">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-auto mx-auto drop-shadow-3xl" />
      </div>

      <div className="mt-10 flex items-start gap-6 p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 shadow-xl transition-all hover:bg-white/[0.05]">
        <div className="w-5 h-5 rounded-full mt-1.5 shrink-0 shadow-[0_0_15px_currentColor] animate-pulse" style={{ backgroundColor: prognosis.color, color: prognosis.color }}></div>
        <div>
          <span className="font-cinzel text-base block font-bold tracking-wide" style={{ color: prognosis.color }}>{prognosis.label}</span>
          <p className="text-[14px] text-slate-400 mt-2 leading-relaxed font-light italic">
            {prognosis.desc}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -12; }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MentalShapeMatrix;
