import { fetchStartGG } from "../fetch-startgg";

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
	winnerId?: number;
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

	await fetchStartGG({
		query: `
			mutation ReportSet($setId: ID!, $gameData: [BracketSetGameDataInput], $winnerId: Int) {
				reportBracketSet(setId: $setId, gameData: $gameData, winnerId: $winnerId) {
					id
				}
			}
		`,
		variables: {
			setId,
			gameData,
			winnerId,
		},
	});
};
