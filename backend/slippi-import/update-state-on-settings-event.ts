import type { GameStartType, PlayerType } from "@slippi/slippi-js/node";
import { updateStateSync } from "../state";
import { applyPlayerTypeToState } from "./apply-playertype";
import { findPlayerInSlippiSettings } from "./find-player-in-slippi-settings";

export const updateStateOnSettingsEvent = (
	logPrefix: string,
	settingsEvent: GameStartType,
	stationNumber: number,
) => {
	updateStateSync((state) => {
		const station = state.stations.find(
			(s) => s.startggStationNumber === stationNumber,
		);

		if (station === undefined) {
			throw new Error(
				`${logPrefix} Received SETTINGS event but station is not in state.`,
			);
		}

		const { currentSet } = station;

		if (currentSet === null) {
			throw new Error(
				`${logPrefix} Received SETTINGS event but there is no current set in state.`,
			);
		}

		const { stageId } = settingsEvent;

		if (stageId === undefined) {
			throw new Error(
				`${logPrefix} Received SETTINGS event but stageId is undefined.`,
			);
		}

		const entrantAP1 = findPlayerInSlippiSettings(
			currentSet.entrantA.player1,
			settingsEvent,
			station.ports,
		);

		const entrantBP1 = findPlayerInSlippiSettings(
			currentSet.entrantB.player1,
			settingsEvent,
			station.ports,
		);

		let entrantAP2: PlayerType | null = null;
		let entrantBP2: PlayerType | null = null;

		if (currentSet.entrantA.player2 !== null) {
			entrantAP2 = findPlayerInSlippiSettings(
				currentSet.entrantA.player2,
				settingsEvent,
				station.ports,
			);
		}

		if (currentSet.entrantB.player2 !== null) {
			entrantBP2 = findPlayerInSlippiSettings(
				currentSet.entrantB.player2,
				settingsEvent,
				station.ports,
			);
		}

		if (
			entrantAP1 === null ||
			entrantBP1 === null ||
			(settingsEvent.isTeams === true &&
				(entrantAP2 === null || entrantBP2 === null))
		) {
			console.warn(
				`${logPrefix} Could not find all players from currentSet in SETTINGS event (i.e. no port found), so it's skipped.`,
			);

			return;
		}

		applyPlayerTypeToState(currentSet.entrantA.player1, entrantAP1);
		applyPlayerTypeToState(currentSet.entrantB.player1, entrantBP1);

		if (
			currentSet.entrantA.player2 !== null &&
			currentSet.entrantB.player2 !== null &&
			entrantAP2 !== null &&
			entrantBP2 !== null
		) {
			applyPlayerTypeToState(currentSet.entrantA.player2, entrantAP2);
			applyPlayerTypeToState(currentSet.entrantB.player2, entrantBP2);
		}

		currentSet.slippiStage = stageId;
	});
};
