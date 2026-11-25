'use client';

import { useState } from 'react';
import DataPanel from './DataPanel';
import MapView from './MapView';

export type Ballot = 'single' | 'proportional';

export type VoteMetric = 'turnout' | 'result';

export interface PrefVotes {
  name: string;
  votes: number;
  // votes_proportional: number;
  percent?: number;
}

export type PrefectureInfo = {
  name: string;
  turnout_total_single: string;
  turnout_female_single: string;
  turnout_male_single: string;
  turnout_total_proportional: string;
  turnout_female_proportional: string;
  turnout_male_proportional: string;
  votes_single: PrefVotes[];
  votes_proportional: PrefVotes[];
};

export type ValueDomain = { low: number; high: number };

export default function ElectionExplorer() {
  const [selected, setSelected] = useState<PrefectureInfo | null>(null);
  const [ballot, setBallot] = useState<Ballot>('single');
  const [voteMetric, setVoteMetric] = useState<VoteMetric>('turnout');

  const valueDomain: ValueDomain = getValueDomain(ballot, voteMetric);

  function getValueDomain(ballot: Ballot, voteMetric: VoteMetric): ValueDomain {
    if (ballot === 'proportional' && voteMetric === 'turnout')
      return { low: 10, high: 35 };
    if (ballot === 'single' && voteMetric === 'turnout')
      return { low: 50, high: 60 };
    return { low: NaN, high: NaN };
  }

  return (
    <>
      <MapView
        onSelect={setSelected}
        ballot={ballot}
        voteMetric={voteMetric}
        mapDomain={valueDomain}
      />
      <DataPanel
        selected={selected}
        ballot={ballot}
        onBallotChange={setBallot}
        voteMetric={voteMetric}
        onVoteMetricChange={setVoteMetric}
        colorBarDomain={valueDomain}
      />
    </>
  );
}
