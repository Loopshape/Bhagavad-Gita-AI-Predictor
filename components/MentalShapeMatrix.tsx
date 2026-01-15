
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { AlignmentState } from '../types';
import { soundService } from '../services/soundService';

interface Props {
  state: AlignmentState;
  onChange: (state: AlignmentState) => void;
}

const MentalShapeMatrix: React.FC<Props> = ({ state, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const prognosis = useMemo(() => {
    if (state.emotionLevel > 30 && state.energyVector > 50) return { label: "Sattvic Clarity", color: "#00ff80", desc: "Pure equilibrium." };
    if (state.energyVector > 70) return { label: "Rajasic Drive", color: "#ffcc00", desc: "Passionate motion." };
    if (state.emotionLevel < -30 && state.energyVector < 40) return { label: "Tamasic Void", color: "#ff3e3e", desc: "Static inertia." };
    return { label: "Dynamic Balance", color: "#00f2ff", desc: "Fluid transition." };
  }, [state]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 400, h = 400, m = 30;
    const xScale = d3.scaleLinear().domain([-100, 100]).range([m, w-m]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([h-m, m]);

    // Grid
    const lines = [-50, 0, 50];
    lines.forEach(l => {
        svg.append("line").attr("x1", xScale(l)).attr("y1", m).attr("x2", xScale(l)).attr("y2", h-m).attr("stroke", "rgba(255,255,255,0.03)");
        svg.append("line").attr("x1", m).attr("y1", yScale(l)).attr("x2", w-m).attr("y2", yScale(l)).attr("stroke", "rgba(255,255,255,0.03)");
    });

    // Hexagon regions
    const zones = [
      { id: 'Sattva', points: [[20,40], [100,40], [100,100], [20,100]], color: '#00ff80' },
      { id: 'Rajas', points: [[-100,60], [100,60], [100,100], [-100,100]], color: '#ffcc00' },
      { id: 'Tamas', points: [[-100,0], [-20,0], [-20,40], [-100,40]], color: '#ff3e3e' }
    ];

    zones.forEach(z => {
      svg.append("rect")
        .attr("x", xScale(z.points[0][0]))
        .attr("y", yScale(z.points[2][1]))
        .attr("width", xScale(z.points[1][0]) - xScale(z.points[0][0]))
        .attr("height", yScale(z.points[0][1]) - yScale(z.points[2][1]))
        .attr("fill", z.color)
        .attr("opacity", 0.05)
        .attr("rx", 10);
    });

    // Pulse point
    svg.append("circle")
      .attr("cx", xScale(state.emotionLevel))
      .attr("cy", yScale(state.energyVector))
      .attr("r", 6)
      .attr("fill", prognosis.color)
      .attr("filter", "drop-shadow(0 0 10px "+prognosis.color+")")
      .attr("class", "animate-pulse");

  }, [state, prognosis]);

  return (
    <div className="glass-panel p-8 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none font-code text-[8px] uppercase tracking-widest leading-tight">
        Matrix_Scan_Active<br/>Vedic_Protocol_43F<br/>Entropy: {Math.random().toFixed(4)}
      </div>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="font-cinzel text-[#ffcc00] text-xl tracking-[0.3em] uppercase mb-2">Mental Matrix</h3>
          <p className="text-[9px] font-code text-white/40 tracking-widest uppercase">Akashic Resonance Point</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-code text-white/20 block">SYNC_STATUS</span>
          <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: prognosis.color }}>0x{prognosis.label.split(' ')[0].toUpperCase()}</span>
        </div>
      </div>

      <div className="relative aspect-square rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-full" />
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex gap-6">
        <div className="w-1 h-12 rounded-full" style={{ background: prognosis.color }}></div>
        <div>
          <h4 className="font-cinzel text-white text-lg tracking-widest">{prognosis.label}</h4>
          <p className="text-white/40 text-xs italic mt-1">{prognosis.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default MentalShapeMatrix;
