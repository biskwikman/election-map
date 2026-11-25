This is a web map I am currently developing to explore the results and voting patterns of the 2026 House of Representatives election in Japan.

The data processing is all done in Python using Pandas. And the output used for the map is in PMTILES format.

The user interface used MapLibre and D3 to visualize the data.

To run this project. Do 'npm run dev' and go to localhost:3000.

The 'pipeline' directory contains the script which prepares all the data, although the pre-processed data is not included in the repository because of its size.

Things I still need to do:
 - Add electoral district results
 - Add winning candidates
 - Fix the euthanasia party on the vote chart, they are currently not appearing in the proportional votes for Tokyo.
 - Add pre-processed data fetching into the data pipeline so the entire thing can be built from scratch.

Things that would be nice to have:
 - Ability to compare 2026 election to other elections
