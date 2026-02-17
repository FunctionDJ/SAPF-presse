import { type } from "arktype";
import { fetchStartGG } from "../fetch-startgg";
import { id } from "../schema-utils";

const Game = type({
	orderNum: id,
	winnerId: id,
	stage: type({ id }).or("null"),
	selections: type({
		character: { id },
		entrant: { id },
	}).array(),
});

const Set_ = type({
	id,
	games: Game.array().or("null"),
	slots: type({
		entrant: {
			id,
			participants: type({
				id,
			}).array(),
		},
	}).array(),
});

export const fetchActiveSet = async (stationId: number) => {
	const data = await fetchStartGG({
		schema: type({
			tournament: {
				events: type({
					sets: {
						nodes: Set_.array(),
					},
				}).array(),
			},
		}),
		query: `
			query GetSetAtStation {
				tournament(slug: "${String(process.env.TOURNAMENT_SLUG)}") {
					events {
						sets(filters: {stationNumbers: [${String(stationId)}], state: 2}) {
							nodes {
								id
								slots {
									entrant {
										id
										participants {
											id
										}
									}
								}
								games {
									orderNum
									stage {
										id
									}
									winnerId
									selections {
										character {
											id
										}
										entrant {
											id
										}
									}
								}
							}
						}
					}
				}
			}
		`,
	});

	return data.tournament.events.flatMap((event) => event.sets.nodes).at(0);
};
