'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PARTY_DATA } from './colors';
import 'd3-transition';
import { PrefVotes } from './ElectionExplorer';

type Datum = {
  name: string;
  abbr: string;
  color: string;
  votes: number;
  percent: number;
};

export default function VoteShareChart({
  votes,
  width = 360,
  height = 200,
}: {
  votes: PrefVotes[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const votesTotal = d3.sum(votes, (v) => v.votes);
    const votesHighest = d3.max(votes, (v) => v.votes) ?? 0;

    const data: Datum[] = Object.values(PARTY_DATA).map((party) => {
      const match = votes.find((v) => v.name === party.name);
      const partyVotes = match?.votes ?? 0;
      return {
        name: party.name,
        abbr: party.abbr[0],
        color: party.color,
        votes: partyVotes,
        percent: votesTotal > 0 ? (partyVotes / votesTotal) * 100 : 0,
      };
    });

    const margin = { top: 16, right: 36, bottom: 28, left: 36 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    const g = svg
      .selectAll<SVGGElement, null>('g.plot')
      .data([null])
      .join('g')
      .attr('class', 'plot')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xAxisG = g
      .selectAll<SVGGElement, null>('g.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`);
    const yLeftG = g
      .selectAll<SVGGElement, null>('g.y-left')
      .data([null])
      .join('g')
      .attr('class', 'y-left');
    const yRightG = g
      .selectAll<SVGGElement, null>('g.y-right')
      .data([null])
      .join('g')
      .attr('class', 'y-right')
      .attr('transform', `translate(${innerW},0)`);
    const barsG = g
      .selectAll<SVGGElement, null>('g.bars')
      .data([null])
      .join('g')
      .attr('class', 'bars');

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.abbr))
      .range([0, innerW])
      .padding(0.1);

    const yRight = d3
      .scaleLinear()
      .domain([0, votesHighest])
      .range([innerH, 0])
      .nice(6);

    const yLeft = d3
      .scaleLinear()
      .domain([0, (yRight.domain()[1] / votesTotal) * 100])
      .range([innerH, 0]);

    const t = d3.transition().duration(400);

    xAxisG.call(d3.axisBottom(x).tickSizeOuter(0));

    yRightG
      .transition(t)
      .call(
        d3
          .axisRight(yRight)
          .tickSizeOuter(0)
          .ticks(5)
          .tickFormat(d3.format('~s')),
      );
    yLeftG.transition(t).call(
      d3
        .axisLeft(yLeft)
        .tickSizeOuter(0)
        .ticks(5)
        .tickFormat((d) => `${d}%`),
    );

    barsG
      .selectAll<SVGRectElement, Datum>('rect')
      .data(data, (d) => d.name) // key: match bars by party
      .join((enter) =>
        enter
          .append('rect')
          .attr('fill', (d) => d.color)
          .attr('y', innerH) // only NEW bars start at 0
          .attr('height', 0),
      )
      .attr('x', (d) => x(d.abbr)!)
      .attr('width', x.bandwidth())
      .transition(t)
      .attr('y', (d) => yRight(d.votes))
      .attr('height', (d) => innerH - yRight(d.votes));
  }, [votes, width, height]);
  return <svg ref={svgRef} width={width} height={height} />;
}
