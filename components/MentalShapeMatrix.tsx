
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { AlignmentState } from '../types';
import { COLORS } from '../constants';

interface Props {
  state: AlignmentState;
  onChange: (state: AlignmentState) => void;
}

const MentalShapeMatrix: React.FC<Props> = ({ state, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);

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

    // Zones
    const zones = [
        { x: [-100, -20], y: [0, 40], color: 'rgba(255, 62, 62, 0.05)', label: 'Tamas' },
        { x: [-100, 100], y: [60, 100], color: 'rgba(245, 158, 11, 0.05)', label: 'Rajas' },
        { x: [20, 100], y: [40, 80], color: 'rgba(0, 255, 128, 0.05)', label: 'Sattva' }
    ];

    zones.forEach(z => {
        svg.append("rect")
            .attr("x", xScale(z.x[0]))
            .attr("y", yScale(z.y[1]))
            .attr("width", xScale(z.x[1]) - xScale(z.x[0]))
            .attr("height", yScale(z.y[0]) - yScale(z.y[1]))
            .attr("fill", z.color)
            .attr("rx", 10);
        
        svg.append("text")
            .attr("x", xScale(z.x[0]) + 5)
            .attr("y", yScale(z.y[1]) + 15)
            .attr("fill", "white")
            .attr("opacity", 0.2)
            .attr("class", "text-[8px] font-bold uppercase")
            .text(z.label);
    });

    // Grid
    svg.append("g").attr("transform", `translate(0,${height / 2})`).call(d3.axisBottom(xScale).ticks(0).tickSize(0)).attr("stroke", "rgba(255,255,255,0.05)");
    svg.append("g").attr("transform", `translate(${width / 2},0)`).call(d3.axisLeft(yScale).ticks(0).tickSize(0)).attr("stroke", "rgba(255,255,255,0.05)");

    // Labels
    svg.append("text").attr("x", width-margin).attr("y", height/2-10).attr("text-anchor", "end").attr("fill", COLORS.positive).attr("class", "text-[8px] font-bold").text("EMOTION +");
    svg.append("text").attr("x", margin).attr("y", height/2-10).attr("text-anchor", "start").attr("fill", COLORS.negative).attr("class", "text-[8px] font-bold").text("AFFECTION -");

    // Shape
    const area = d3.area().x(d => xScale(d[0])).y0(yScale(0)).y1(d => yScale(d[1])).curve(d3.curveBasis);
    const blobData: [number, number][] = [
        [-100, 0],
        [state.emotionLevel - 30, state.energyVector * 0.4],
        [state.emotionLevel, state.energyVector],
        [state.emotionLevel + 30, state.energyVector * 0.4],
        [100, 0]
    ];

    svg.append("path")
      .datum(blobData)
      .attr("d", area as any)
      .attr("fill", d3.interpolateRgb(COLORS.negative, COLORS.positive)((state.emotionLevel + 100)/200))
      .attr("opacity", 0.15);

    // Vector
    svg.append("line")
      .attr("x1", width/2).attr("y1", height-margin)
      .attr("x2", xScale(state.emotionLevel)).attr("y2", yScale(state.energyVector))
      .attr("stroke", COLORS.accent).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,2");

    // Interaction Node
    svg.append("circle")
      .attr("cx", xScale(state.emotionLevel)).attr("cy", yScale(state.energyVector)).attr("r", 10)
      .attr("fill", COLORS.accent).attr("class", "cursor-pointer")
      .call(d3.drag<SVGCircleElement, unknown>()
        .on("drag", (event) => {
          onChange({
            ...state,
            emotionLevel: xScale.invert(Math.max(margin, Math.min(width - margin, event.x))),
            energyVector: yScale.invert(Math.max(margin, Math.min(height - margin, event.y)))
          });
        })
      );

  }, [state, onChange]);

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-cinzel text-lg text-accent">Mental Prognose</h3>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-subtext uppercase tracking-widest">Vector Driven Scope</span>
      </div>
      
      <div className="relative">
        <svg ref={svgRef} width="400" height="400" className="mx-auto rounded-xl border border-white/5" />
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: prognosis.color }}></div>
          <span className="font-cinzel text-sm" style={{ color: prognosis.color }}>{prognosis.label}</span>
        </div>
        <p className="text-xs text-subtext mt-1 italic">{prognosis.desc}</p>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;
