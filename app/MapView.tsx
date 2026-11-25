'use client';

import { useEffect, useRef } from 'react';
import {
  addProtocol,
  Map,
  setWorkerUrl,
  removeProtocol,
  ExpressionSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol } from 'pmtiles';
import type {
  Ballot,
  PrefectureInfo,
  ValueDomain,
  VoteMetric,
} from './ElectionExplorer';
import { PARTY_DATA as pd } from './colors';

setWorkerUrl(
  new URL(
    'maplibre-gl/dist/maplibre-gl-worker.mjs',
    import.meta.url,
  ).toString(),
);

const PMTILES_URL = '/tiles/boundaries_jp.pmtiles';

function fillColor(
  ballot: Ballot,
  mapDomain: ValueDomain,
  voteMetric: VoteMetric,
): ExpressionSpecification {
  const b = ballot === 'single' ? 's' : 'p';
  if (voteMetric === 'turnout') {
    return [
      'interpolate',
      ['linear'],
      ['get', `total_turnout_${ballot}_2026`],
      mapDomain.low,
      '#f7fbff',
      mapDomain.high,
      '#08306b',
    ];
  } else {
    return [
      'match',
      ['get', `most_votes_${b}`],
      ...Object.values(pd).flatMap((party) => [party.name, party.color]), // pd.自由民主党.name,
      '#000000',
    ] as unknown as ExpressionSpecification;
  }
}

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  onSelect?: (info: PrefectureInfo | null) => void;
  ballot: Ballot;
  voteMetric: VoteMetric;
  mapDomain: ValueDomain;
};

export default function MapView({
  center = [140, 36],
  zoom = 4,
  onSelect,
  ballot = 'single',
  voteMetric = 'turnout',
  mapDomain,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const protocol = new Protocol();
    addProtocol('pmtiles', protocol.tile);
    protocol.add(new PMTiles(PMTILES_URL));

    const map = new Map({
      container: containerRef.current,
      center,
      zoom,
      minZoom: 4,
      maxZoom: 13,
      style: {
        version: 8,
        sources: {
          'mlit_source': {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`,
            attribution: 'MLIT',
          },
        },
        layers: [
          {
            'id': 'prefectures',
            'source': 'mlit_source',
            'source-layer': 'prefecture',
            'type': 'fill',
            'paint': {
              'fill-color': fillColor(ballot, mapDomain, voteMetric),
              'fill-outline-color': '#000000',
            },
          },
        ],
      },
    });

    // selected polygon outline (style must finish loading before addLayer)
    map.on('load', () => {
      map.addLayer({
        id: 'polygon-selected-outline',
        type: 'line',
        source: 'mlit_source',
        'source-layer': 'prefecture',
        paint: { 'line-color': '#000000', 'line-width': 3 },
        layout: { 'line-join': 'round' },
        filter: ['==', ['id'], ''], // matches nothing atm
      });
    });

    // Change cursor to pointer
    map.on('mouseenter', 'prefectures', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'prefectures', () => {
      map.getCanvas().style.cursor = '';
    });

    // Fly to selected prefecture
    let selected = '';
    map.on('click', 'prefectures', (e) => {
      const feature = e.features?.[0];
      if (!feature || feature.id === undefined) return;

      // If prefecture is already selected and clicked again, deselect and zoom out
      if (selected === feature.properties.N03_001) {
        selected = '';
        map.flyTo({ center, zoom });
        map.setFilter('polygon-selected-outline', ['==', ['id'], '']);
        onSelectRef.current?.(null);
        return;
      }
      const props = feature.properties;
      selected = feature.properties.N03_001;
      onSelectRef.current?.({
        name: feature.properties.N03_001,
        turnout_total_single: props.total_turnout_single_2026,
        turnout_female_single: props.women_turnout_single_2026,
        turnout_male_single: props.men_turnout_single_2026,
        turnout_total_proportional: props.total_turnout_proportional_2026,
        turnout_female_proportional: props.women_turnout_proportional_2026,
        turnout_male_proportional: props.men_turnout_proportional_2026,
        votes_single: [
          { name: '自由民主党', votes: props.自由民主党_s },
          { name: '中道改革連合', votes: props.中道改革連合_s },
          { name: '日本維新の会', votes: props.日本維新の会_s },
          { name: '国民民主党', votes: props.国民民主党_s },
          { name: '参政党', votes: props.参政党_s },
          { name: '日本共産党', votes: props.日本共産党_s },
          { name: '令和新選組', votes: props.令和新選組_s },
          {
            name: '減税日本・ゆうこく連合',
            votes: props['減税日本・ゆうこく連合_s'],
          },
          { name: '日本保守党', votes: props.日本保守党_s },
          { name: '社会民主党', votes: props.社会民主党_s },
          { name: 'チームみらい', votes: props.チームみらい_s },
          { name: '無所属', votes: props.無所属_s },
          { name: '諸派', votes: props.諸派_s },
        ],
        votes_proportional: [
          { name: '自由民主党', votes: props.自由民主党_p },
          { name: '中道改革連合', votes: props.中道改革連合_p },
          { name: '日本維新の会', votes: props.日本維新の会_p },
          { name: '国民民主党', votes: props.国民民主党_p },
          { name: '参政党', votes: props.参政党_p },
          { name: '日本共産党', votes: props.日本共産党_p },
          { name: '令和新選組', votes: props.令和新選組_p },
          {
            name: '減税日本・ゆうこく連合',
            votes: props['減税日本・ゆうこく連合_p'],
          },
          { name: '日本保守党', votes: props.日本保守党_p },
          { name: '社会民主党', votes: props.社会民主党_p },
          { name: 'チームみらい', votes: props.チームみらい_p },
          { name: '安楽死制度を考える会', votes: props.安楽死制度を考える会_p },
        ],
      });

      const bbox = feature.properties.pref_bbox
        .slice(1, -1)
        .split(',')
        .map(Number);

      map.setFilter('polygon-selected-outline', [
        '==',
        ['get', 'N03_001'],
        feature.properties.N03_001,
      ]);

      map.fitBounds(bbox, { padding: 30 });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      removeProtocol('pmtiles');
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () =>
      map.setPaintProperty(
        'prefectures',
        'fill-color',
        fillColor(ballot, mapDomain, voteMetric),
      );

    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [ballot, voteMetric]);

  return <div ref={containerRef} className="h-full flex-1 min-w-0" />;
}
