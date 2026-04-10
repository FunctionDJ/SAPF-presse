import type { GameEndType } from "@slippi/slippi-js/node";
import { prefixLogger } from "../logger";
import { getStationOrThrow } from "../state";
import { fetchSetGames } from "./fetch-set-games";
import { reportBracketSet, type Selection } from "./report-bracket-set";
import {
	slippiCharacterToStartGGCharacter,
	slippiStageToStartGGStageId,
} from "./slippi-to-startgg";

export const reportBracketSetBySlippiData = async ({
	gameEnd,
	stationNumber,
}: {
	gameEnd: GameEndType;
	stationNumber: number;
}) => {
	const logger = prefixLogger("StartggExport", `Station ${stationNumber}`);
	logger.info(`Reporting to startgg...`);

	const station = getStationOrThrow(stationNumber);

	const { currentSet } = station;

	if (currentSet === null) {
		logger.error(`No current set in state, skipping report`);
		return;
	}

	const setGames = await fetchSetGames(currentSet.startggSetId);

	if (setGames === null) {
		logger.error(`Could not fetch set games, skipping report`);
		return;
	}

	// Determine winner based on which port won
	const winnerPortIndex = gameEnd.placements.findIndex((p) => p.position === 0);
	logger.info(`winnerPortIndex: ${winnerPortIndex}`);

	if (winnerPortIndex === -1) {
		logger.error(`Could not determine winner from placements, skipping report`);
		return;
	}

	if (station.mode !== "startgg") {
		logger.warn(
			`Station mode is not "startgg" (is "${station.mode}"), skipping report`,
		);
		return;
	}

	const winnerParticipantId = station.ports[winnerPortIndex];
	logger.info(`winnerParticipantId: ${winnerParticipantId}`);

	if (winnerParticipantId === null) {
		logger.error(
			`Winner port ${winnerPortIndex} has no participant mapped, skipping report`,
		);
		return;
	}

	const entrants = [currentSet.entrantA, currentSet.entrantB];

	const winnerEntrant = entrants.find(
		(entrant) =>
			entrant.player1.startggParticipantId === winnerParticipantId ||
			entrant.player2?.startggParticipantId === winnerParticipantId,
	);

	if (!winnerEntrant) {
		logger.error(
			`Could not find entrant for participant ${winnerParticipantId}`,
		);

		return;
	}

	logger.info("winnerEntrant", { winnerEntrant });

	/**
	 * TODO
	 * for correct character display on start.gg, the selections
	 * should probably be sorted according to the order of the entrants
	 * and participants.
	 * i'm not sure if the current order is correct.
	 */

	// startgg stores an array of selections per entrant (which can be a team), not per participant.

	const selections: Selection[] = [
		{
			slippiCharacterId:
				currentSet.entrantA.player1.character?.slippiCharacterId ?? null,
			entrantId: currentSet.entrantA.startggEntrantId,
		},
		{
			slippiCharacterId:
				currentSet.entrantA.player2?.character?.slippiCharacterId ?? null,
			entrantId: currentSet.entrantA.startggEntrantId,
		},
		{
			slippiCharacterId:
				currentSet.entrantB.player1.character?.slippiCharacterId ?? null,
			entrantId: currentSet.entrantB.startggEntrantId,
		},
		{
			slippiCharacterId:
				currentSet.entrantB.player2?.character?.slippiCharacterId ?? null,
			entrantId: currentSet.entrantB.startggEntrantId,
		},
	].flatMap(({ slippiCharacterId, entrantId }) => {
		const characterId = slippiCharacterToStartGGCharacter(slippiCharacterId);
		return characterId === null ? [] : [{ characterId, entrantId }];
	});

	const gameData = [
		...setGames.map((game) => ({
			gameNum: game.orderNum,
			winnerId: game.winnerId,
			stageId: game.stage?.id ?? null,
			selections: game.selections.map((selection) => ({
				entrantId: selection.entrant.id,
				characterId: selection.character.id,
			})),
		})),
		{
			// this is just the winnerId for this match, not the whole set
			winnerId: winnerEntrant.startggEntrantId,
			gameNum: setGames.length + 1,
			stageId: slippiStageToStartGGStageId(currentSet.slippiStage),
			selections,
		},
	];

	logger.info(`gameData`, { gameData });

	// the following is the winnerId for the whole set

	const sendWinner =
		currentSet.entrantA.score + currentSet.entrantB.score + 1 >= station.bestOf;

	logger.info(`sendWinner: ${sendWinner}`);

	if (sendWinner && gameData.length !== station.bestOf) {
		logger.warn(
			`Game data length (${gameData.length}) does not match expected bestOf (${station.bestOf})`,
		);
	}

	const winnerId = sendWinner ? winnerEntrant.startggEntrantId : null;

	await reportBracketSet({
		winnerId,
		setId: currentSet.startggSetId,
		gameData,
	});
};
