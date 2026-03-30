import { fetchStartGG } from "../startgg-interface/fetch-startgg";

export interface Selection {
	entrantId: number;
	characterId: number;
}

export const reportBracketSet = async ({
	setId,
	gameData,
	winnerId,
}: {
	setId: number;
	winnerId: number | null;
	gameData: {
		gameNum: number;
		winnerId: number;
		stageId: number | null;
		selections: Selection[];
	}[];
}) => {
	console.log("reportBracketSet");
	console.log("setId", setId);
	console.log("set winnerId", winnerId);
	console.log("gameData", JSON.stringify(gameData, null, 2));

	const variables: {
		setId: number;
		gameData: typeof gameData;
		winnerId?: number;
	} = {
		setId,
		gameData,
	};

	if (winnerId !== null) {
		variables.winnerId = winnerId;
	}

	await fetchStartGG({
		query: `
			mutation ReportSet($setId: ID!, $gameData: [BracketSetGameDataInput], $winnerId: Int) {
				reportBracketSet(setId: $setId, gameData: $gameData, winnerId: $winnerId) {
					id
				}
			}
		`,
		variables,
	});
};
