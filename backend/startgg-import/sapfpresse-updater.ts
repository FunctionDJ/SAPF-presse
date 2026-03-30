import { type } from "arktype";
import { signalUpdate, state } from "../state";
import { Event } from "./startgg-schemas";
import { getNewStationByEvents } from "./startgg-transformers";

const Response = type({
	data: {
		tournament: {
			events: Event.array(),
		},
	},
});

const gql = `
query SetsAtStations {
  tournament(slug: "sapf2-test") {
    events {
      sets(filters: {stationNumbers: [1,2,3,4]}) {
        nodes {
          id
          phaseGroup {
            displayIdentifier
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
    }
  }
}`;

const fetchStartGGAndUpdateState = async () => {
	const response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		body: JSON.stringify({
			query: gql,
		}),
		headers: {
			Authorization: `Bearer ${process.env.STARTGG_API_KEY}`,
		},
	});

	const data = await response.json();
	const out = Response(data);

	if (out instanceof type.errors) {
		// TODO better error handling
		console.error("Error fetching/parsing start.gg data:", out.summary);
		throw new Error(out.summary);
	}

	state.stations = state.stations.map((oldStation) =>
		getNewStationByEvents(oldStation, out.data.tournament.events),
	);

	signalUpdate();
};

setInterval(() => {
	// TODO errors get discarded here
	void fetchStartGGAndUpdateState();
}, 5000);
