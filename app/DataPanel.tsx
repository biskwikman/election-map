'use client';

import {
  Ballot,
  PrefectureInfo,
  ValueDomain,
  VoteMetric,
} from './ElectionExplorer';
import TurnoutChart from './TurnoutChart';
import VoteShareChart from './VoteShareChart';
import MapColorBar from './MapColorBar';
import PartyKey from './PartyKey';

const BALLOT_LABELS: Record<Ballot, string> = {
  single: '小選挙区',
  proportional: '比例代表',
};

const VOTE_METRIC_LABELS: Record<VoteMetric, string> = {
  turnout: '投票率',
  result: '得票数',
};

function ShowViz({
  selected,
  voteMetric,
  ballot,
}: {
  selected: PrefectureInfo | null;
  voteMetric: VoteMetric;
  ballot: Ballot;
}) {
  if (selected && voteMetric === 'turnout') {
    return (
      <>
        <p className="mt-4">{selected.name}</p>
        <p>計: {selected[`turnout_total_${ballot}`]}%</p>
        <div className="mt-4">
          <TurnoutChart
            male={selected[`turnout_male_${ballot}`]}
            female={selected[`turnout_female_${ballot}`]}
          />
        </div>
      </>
    );
  } else if (selected && voteMetric === 'result') {
    return (
      <>
        <p className="mt-4">{selected.name}</p>
        <div className="mt-4">
          <VoteShareChart votes={selected[`votes_${ballot}`]} />
        </div>
      </>
    );
  } else if (!selected) {
    return <p className="mt-4 text-slate-500">Click a prefecture</p>;
  }
}

export default function DataPanel({
  selected,
  ballot,
  voteMetric,
  onBallotChange,
  onVoteMetricChange,
  colorBarDomain,
}: {
  selected: PrefectureInfo | null;
  ballot: Ballot;
  voteMetric: VoteMetric;
  onBallotChange: (b: Ballot) => void;
  onVoteMetricChange: (v: VoteMetric) => void;
  colorBarDomain: ValueDomain;
}) {
  return (
    <aside className="w-2/7 flex flex-col shrink-0 overflow-y-auto border-l border-gray-400 text-black bg-slate-100 p-4">
      <h1 className="text-2xl font-bold">衆院選2026マップ</h1>
      <p className="text-xs">
        <i>By Daniel Henri</i>
      </p>
      <p className="text-xs">
        <a href="https://github.com/biskwikman/election-map">
          <i>click here for git repo...</i>
        </a>
      </p>
      <select
        className="rounded border border-gray-400 bg-white px-2 py-1"
        value={voteMetric}
        onChange={(e) => onVoteMetricChange(e.target.value as VoteMetric)}
      >
        {(Object.keys(VOTE_METRIC_LABELS) as VoteMetric[]).map((key) => (
          <option key={key} value={key}>
            {VOTE_METRIC_LABELS[key]}
          </option>
        ))}{' '}
      </select>
      <select
        className="mb-2 mt-2 rounded border border-gray-400 bg-white px-2 py-1"
        value={ballot}
        onChange={(e) => onBallotChange(e.target.value as Ballot)}
      >
        {(Object.keys(BALLOT_LABELS) as Ballot[]).map((key) => (
          <option key={key} value={key}>
            {BALLOT_LABELS[key]}
          </option>
        ))}{' '}
      </select>
      {voteMetric === 'turnout' ? (
        <MapColorBar colorBarDomain={colorBarDomain} />
      ) : (
        <PartyKey />
      )}
      <ShowViz selected={selected} voteMetric={voteMetric} ballot={ballot} />
    </aside>
  );
}
