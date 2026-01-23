import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapData, MindMapNode, MindMapLink } from '../types';

interface Props {
  data: MindMapData;
  onNodeClick?: (nodeId: string) => void;
}

const MindMap: React.FC<Props> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = containerRef.current?.clientWidth || 600;
    const height = 400;

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Simulation Setup
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(30));

    // Render Links
    const link = svg.append("g")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.2)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.strength || 1));

    // Render Nodes (Fractal Groups)
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(drag(simulation) as any)
      .on("click", (event, d) => onNodeClick && onNodeClick(d.id));

    // Core Node Circle
    node.append("circle")
      .attr("r", 8)
      .attr("fill", (d) => d.color || "#00f2ff")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Fractal Orbit (Decorative)
    node.append("circle")
      .attr("r", 14)
      .attr("fill", "none")
      .attr("stroke", (d) => d.color || "#00f2ff")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "2,2");

    // Labels
    node.append("text")
      .text((d) => d.label)
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "10px")
      .attr("font-family", "monospace");

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data]);

  // Drag behavior
  const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return (
    <div className="glass-panel p-4 overflow-hidden relative" ref={containerRef}>
       <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none font-code text-[9px] uppercase tracking-widest leading-tight text-right">
        Neural_Topography<br/>Genesis_Hash_Map<br/>Nodes: {data.nodes.length}
      </div>
      <svg ref={svgRef} className="w-full h-[400px] cursor-move" />
    </div>
  );
};

export default MindMap;
