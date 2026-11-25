'use client';

import { PARTY_DATA } from './colors';

const HIDDEN = ['無所属', '諸派'];

export default function PartyKey() {
  return (
    <div>
      <ul className="grid grid-cols-3">
        {Object.entries(PARTY_DATA)
          .filter(([key]) => !HIDDEN.includes(key))
          .map(([, party]) => (
            <li className="flex items-center" key={party.name}>
              <div
                className="size-3 shrink-0"
                style={{ backgroundColor: party.color }}
              ></div>
              <span className="m-1 text-xs">{party.abbr}</span>
            </li>
          ))}
        <li className="flex items-center" key="無・諸">
          <div
            className="size-3 shrink-0"
            style={{ backgroundColor: PARTY_DATA.無所属.color }}
          ></div>
          <span className="m-1 text-xs">無・諸</span>
        </li>
      </ul>
    </div>
  );
}
