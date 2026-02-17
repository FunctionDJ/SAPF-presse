import { CircularProgress, DialogContentText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { z, type ZodError } from "zod";
import { Station } from "./Station";
import { eventSchema } from "../../shared/startgg-schemas";

const querySchema = z.object({
	data: z.object({
		tournament: z.object({
			events: z.array(eventSchema),
		}),
	}),
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

export function App() {
	const stationQuery = useQuery({
		queryKey: ["stations"],
		refetchInterval: 5000,
		retry: false,
		queryFn: async () =>
			fetch("https://api.start.gg/gql/alpha", {
				method: "POST",
				body: JSON.stringify({
					query: gql,
				}),
				headers: {
					Authorization: `Bearer ${import.meta.env.VITE_STARTGG_API_KEY}`,
				},
			})
				.then((r) => r.json())
				.then((data) => {
					try {
						return querySchema.parse(data);
					} catch (error) {
						throw new Error(z.prettifyError(error as ZodError));
					}
				}),
	});

	if (stationQuery.isLoading) {
		return (
			<div className="h-dvh grid place-content-center">
				<div className="flex gap-4 items-center">
					<CircularProgress />
					<DialogContentText>Loading start.gg data...</DialogContentText>
				</div>
			</div>
		);
	}

	if (!stationQuery.isSuccess) {
		return (
			<div>
				<p>{stationQuery.status}</p>
				<pre>{String(stationQuery.error)}</pre>
			</div>
		);
	}

	return (
		<div className="h-dvh border p-4 flex flex-col gap-8">
			<span className="font-black text-5xl text-center">
				Side-Stream Self-Service
			</span>
			<div className="flex gap-4 grow overflow-scroll p-4">
				{[1, 2, 3, 4].map((id) => (
					<Station
						key={id}
						id={id}
						sets={stationQuery.data.data.tournament.events.flatMap((e) =>
							e.sets.nodes.filter((set) => set.station.number === id),
						)}
					/>
				))}
			</div>
		</div>
	);
}
