import { type } from "arktype";
import { globalState as globalState, updateStateSync } from "../state";
import { SetType } from "./startgg-schemas";
import { getNewStationByStreamQueueSets } from "./startgg-transformers";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

// TODO

/**
 * the request and the surrounding code need to consider the stream queue.
 * right now, all sets from the stations are fetched and the stream queue is ignored.
 */

const fetchStartGGAndUpdateState = async () => {
	if (
		globalState.startggTournamentId === null ||
		globalState.startggStreamQueueIdToTrack === null
	) {
		return;
	}

	const data = await fetchStartGG(`
    query StreamQueues {
      streamQueue(tournamentId: ${globalState.startggTournamentId}, includePlayerStreams: false) {
        id
        sets {
          id
          round
          phaseGroup {
            displayIdentifier
            numRounds
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
		throw new Error(
			`Stream queue with id ${globalState.startggStreamQueueIdToTrack} not found in start.gg response, either wrong tournament or deleted stream queue configured`,
		);
	}

	updateStateSync((state) => {
		state.stations = state.stations.map((oldStation) =>
			getNewStationByStreamQueueSets(oldStation, streamQueue.sets),
		);
	});
};

void fetchStartGGAndUpdateState();

setInterval(() => {
	fetchStartGGAndUpdateState().catch((err: unknown) => {
		console.error(
			"[StartggImport] Error fetching or JSON-parsing start.gg data (skipping state update):",
			err,
		);
	});
}, 5000);
