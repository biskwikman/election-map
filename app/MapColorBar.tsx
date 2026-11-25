'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ValueDomain } from './ElectionExplorer';

export default function MapColorBar({
  width = 200,
  height = 30,
  colorBarDomain,
}: {
  width?: number;
  height?: number;
  colorBarDomain: ValueDomain;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { left: 12, right: 12 };
    const barHeight = 12;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const x = d3
      .scaleLinear()
      .domain([colorBarDomain.low, colorBarDomain.high])
      .range([0 + margin.left, width - margin.right]);

    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'colorbar-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%'); // left → right

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f7fbff');
    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#08306b');

    svg
      .append('rect')
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', barHeight)
      .attr('fill', 'url(#colorbar-gradient)')
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.8);

    g.append('g')
      .attr('transform', `translate(0, ${barHeight + 2})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickFormat((d) => `${d}%`),
      );
  }, [colorBarDomain]);
  return <svg ref={svgRef} width={width} height={height} />;
}
