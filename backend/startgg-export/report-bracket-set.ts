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
	const logPrefix = `[StartggExport] [SetId ${setId}]`;
	console.log(`${logPrefix} winnerId`, winnerId);
	console.log(`${logPrefix} gameData`, JSON.stringify(gameData, null, 2));

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

	await fetchStartGG(
		`
			mutation ReportSet($setId: ID!, $gameData: [BracketSetGameDataInput], $winnerId: Int) {
				reportBracketSet(setId: $setId, gameData: $gameData, winnerId: $winnerId) {
					id
				}
			}
		`,
		variables,
	);
};
