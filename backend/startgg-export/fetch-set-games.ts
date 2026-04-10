import { type } from "arktype";
import { prefixLogger } from "../logger";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";
import { globalState } from "../state";

// we fetch the active set basically just to get the game selections for the next report to startgg
export const fetchSetGames = async (setId: number) => {
	const slug = globalState.startggTournamentSlug;

	if (slug === null) {
		prefixLogger("StartggExport").error(
			"Can't fetchSetGames because tournament slug is null",
		);

		return null;
	}

	const data = await fetchStartGG(`
		query Set {
			set(id: ${setId}) {
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
	`);

	const validatedData = type({
		set: {
			games: type({
				orderNum: "number.integer >= 0",
				winnerId: "number.integer >= 0",
				stage: type({ id: "number.integer >= 0" }).or("null"),
				selections: type({
					character: { id: "number.integer >= 0" },
					entrant: { id: "number.integer >= 0" },
				})
					.array()
					.or("null"),
			})
				.array()
				.or("null"),
		},
	}).assert(data);

	return (validatedData.set.games ?? []).map((game) => ({
		...game,
		selections: game.selections ?? [],
	}));
};
