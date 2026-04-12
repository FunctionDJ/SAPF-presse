import { type } from "arktype";
import { globalState as globalState, updateStateSync } from "../state";
import { SetType } from "./startgg-schemas";
import { transformStationByStreamQueueSets } from "./startgg-transformers";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";
import { prefixLogger } from "../logger";

const fetchStartGGAndUpdateState = async () => {
	if (
		globalState.startggTournamentId === null ||
		globalState.startggStreamQueueIdToTrack === null
	) {
		return;
	}

	/**
	 * i've asked on startgg discord and other users said that
	 * it's not currently possible to request a specific streamQueue.
	 * so we have to fetch all and then filter ourselves.
	 * might be wasteful for their bandwidth and processing
	 * but i don't know of a solution.
	 */

	// TODO the below breaks on tournaments with many/big queues:
	// "[FetchStartGG] GraphQL error(s): Your query complexity is too high. A maximum of 1000 objects may be returned by each request. (actual: 2724)
	// workaround: fetch queues with set ids first, then use p-queue or similar to fetch individual sets with the rest of the data we need

	const data = await fetchStartGG(`
    query StreamQueues {
      streamQueue(tournamentId: ${globalState.startggTournamentId}, includePlayerStreams: false) {
        id
        sets {
          id
          fullRoundText
          round
          phaseGroup {
            displayIdentifier
            bracketType
          }
          state
          startedAt
          station {
            number
          }
          slots {
            slotIndex
            standing {
              totalPoints
              placement
              stats {
                score {
                  label
                  value
                  displayValue
                }
              }
            }
            entrant {
              id
              name
              team {
                id
                name
              }
              participants {
                id
                gamerTag
                prefix
                user {
                  genderPronoun
                }
              }
            }
          }
        }
      }
    }`);

	const validatedData = type({
		streamQueue: type({
			id: "string",
			sets: SetType.array(),
		}).array(),
	}).assert(data);

	const streamQueue = validatedData.streamQueue.find(
		(sq) => sq.id === globalState.startggStreamQueueIdToTrack,
	);

	if (streamQueue === undefined) {
		const message = `Stream queue with id ${globalState.startggStreamQueueIdToTrack} not found in start.gg response, either wrong tournament or deleted stream queue configured`;

		prefixLogger("StartggImport").warn(message);
return
		// throw new Error(message);
	}

	updateStateSync((state) => {
		for (const station of state.stations) {
			transformStationByStreamQueueSets(station, streamQueue.sets);
		}
	});
};

void fetchStartGGAndUpdateState();

setInterval(() => {
	fetchStartGGAndUpdateState().catch((error: unknown) => {
		prefixLogger("StartggImport").error(
			"[StartggImport] Error fetching or JSON-parsing start.gg data (skipping state update):",
			error,
		);
	});
}, 5000);
