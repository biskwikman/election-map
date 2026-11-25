'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import 'd3-transition';

type Datum = { 'label': string; 'value': number };

export default function TurnoutChart({
  male,
  female,
  width = 280,
  height = 200,
}: {
  male: string;
  female: string;
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const data: Datum[] = [
      { label: '男', value: parseFloat(male) },
      { label: '女', value: parseFloat(female) },
    ];

    const margin = { top: 16, right: 12, bottom: 28, left: 36 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    const g = svg
      .selectAll<SVGGElement, null>('g.plot')
      .data([null])
      .join('g')
      .attr('class', 'plot')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerW])
      .padding(0.35);

    const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

    g.selectAll<SVGGElement, null>('g.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x));

    g.selectAll<SVGGElement, null>('g.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${d}%`),
      );

    const color = d3
      .scaleOrdinal<string>()
      .domain(['男', '女'])
      .range(['#3b82f6', '#ec4899']);

    const t = d3.transition().duration(400);

    g.selectAll<SVGRectElement, Datum>('rect')
      .data(data, (d) => d.label)
      .join((enter) =>
        enter
          .append('rect')
          .attr('fill', (d) => color(d.label))
          .attr('y', innerH)
          .attr('height', 0),
      )
      .attr('x', (d) => x(d.label)!)
      .attr('width', x.bandwidth())
      .transition(t)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => innerH - y(d.value));

    g.selectAll<SVGTextElement, Datum>('text.value')
      .data(data, (d) => d.label)
      .join((enter) =>
        enter
          .append('text')
          .attr('class', 'value')
          .attr('text-anchor', 'middle')
          .attr('font-size', 12)
          .attr('y', innerH - 4),
      )
      .attr('x', (d) => x(d.label)! + x.bandwidth() / 2)
      .transition(t)
      .attr('y', (d) => y(d.value) - 4)
      .textTween(function (d) {
        // count from the number currently shown to the new one
        const from = parseFloat(this.textContent ?? '') || 0;
        const i = d3.interpolateNumber(from, d.value);
        return (p) => `${i(p).toFixed(1)}%`;
      });
  }, [male, female, width, height]);
  return <svg ref={svgRef} width={width} height={height} />;
}
