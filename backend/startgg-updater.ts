import { type } from "arktype";
import { Event } from "../shared/startgg-schemas";
import { updateState } from "./state";

const querySchemaArk = type({
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
			Authorization: `Bearer ${process.env.VITE_STARTGG_API_KEY}`,
		},
	});

	const data = await response.json();
	const out = querySchemaArk(data);

	if (out instanceof type.errors) {
		// TODO better error handling
		console.error("Error fetching/parsing start.gg data:", out.summary);
		throw new Error(out.summary);
	}

	updateState((oldState) => ({
		...oldState,
		stations: oldState.stations.map((station) => {
			return {
				...station,
				playersStartgg: out.data.tournament.events.flatMap((event) =>
					event.sets.nodes.filter(
						(set) => set.station?.number === station.number,
					),
				),
			};
		}),
	}));
};

setInterval(() => {
	// TODO errors get discarded here
	void fetchStartGGAndUpdateState();
}, 5000);
