import type { GameEndType, GameStartType } from "@slippi/slippi-js/node";
import { fetchActiveSet } from "../shared/startgg/fetch-active-set";
import {
	reportBracketSet,
	type Selection,
} from "../shared/startgg/report-bracket-set";
import {
	slippiCharacterToStartGGCharacter,
	slippiStageToStartGGStageId,
} from "./slippi-to-startgg";

export const reportBracketSetBySlippiData = async ({
	portsStorage,
	data: { gameEnd, settings, stationId },
}: {
	portsStorage: Record<number, (number | null)[]>;
	data: {
		gameEnd: GameEndType;
		settings: GameStartType;
		stationId: number;
	};
}) => {
	console.log("reportBracketSetBySlippiData");

	const ports = portsStorage[stationId];

	console.log("ports", ports);

	if (ports === undefined) {
		console.error(`No port mapping for station ${stationId}`);
		return;
	}

	const activeSet = await fetchActiveSet(stationId);

	if (activeSet === undefined) {
		console.error(`No active set found for station ${stationId}`);
		return;
	}

	// Determine winner based on which port won
	const winnerPortIndex = gameEnd.placements.findIndex((p) => p.position === 0);
	console.log("winnerPortIndex", winnerPortIndex);

	if (winnerPortIndex === -1) {
		console.error("Could not determine winner from placements");
		return;
	}

	const winnerParticipantId = ports[winnerPortIndex];
	console.log("winnerParticipantId", winnerParticipantId);

	if (winnerParticipantId === null) {
		console.error(`Winner port ${winnerPortIndex} has no participant mapped`);
		return;
	}

	// Find which entrant this participant belongs to
	const winnerEntrant = activeSet.slots.find((slot) =>
		slot.entrant.participants.some((p) => p.id === winnerParticipantId),
	);

	console.log("winnerEntrant", winnerEntrant);

	if (!winnerEntrant) {
		console.error(
			`Could not find entrant for participant ${winnerParticipantId}`,
		);
		return;
	}

	const existingGames = activeSet.games ?? [];

	console.log("selections:");

	const selections: Selection[] = settings.players
		.map((player) => {
			const participantId = ports[player.port - 1];

			console.log("player.port", player.port, "participantId", participantId);

			if (participantId === null) {
				return null;
			}

			const entrant = activeSet.slots.find((slot) =>
				slot.entrant.participants.some((p) => p.id === participantId),
			);

			console.log("entrant", entrant);

			const startggCharacterId = slippiCharacterToStartGGCharacter(
				player.characterId,
			);

			console.log("player.characterId", player.characterId);
			console.log("startggCharacterId", startggCharacterId);

			if (entrant === undefined || startggCharacterId === null) {
				return null;
			}

			return {
				entrantId: entrant.entrant.id,
				characterId: startggCharacterId,
			};
		})
		.filter((s) => s !== null);

	const gameData = [
		...existingGames.map((game) => ({
			gameNum: game.orderNum,
			winnerId: game.winnerId,
			stageId: game.stage?.id ?? null,
			selections: game.selections.map((selection) => ({
				entrantId: selection.entrant.id,
				characterId: selection.character.id,
			})),
		})),
		{
			winnerId: winnerEntrant.entrant.id,
			gameNum: existingGames.length + 1,
			stageId: slippiStageToStartGGStageId(settings.stageId),
			selections,
		},
	];

	console.log("gameData", JSON.stringify(gameData, null, 2));

	await reportBracketSet({
		// TODO only send this set winnerId if the set is actually over (e.g. not just game 1 of a bo3)
		winnerId: winnerEntrant.entrant.id,
		setId: activeSet.id,
		gameData,
	});
};
