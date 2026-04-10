import type { GameStartType } from "@slippi/slippi-js/node";
import type { PlayerInActiveStartGGSet, Ports } from "../state";

export const findPlayerInSlippiSettings = (
	currentSetPlayer: typeof PlayerInActiveStartGGSet.infer,
	slippiSettingsEvent: GameStartType,
	stationPorts: typeof Ports.infer,
) => {
	const portNumber = stationPorts.indexOf(
		currentSetPlayer.startggParticipantId,
	);

	// " - 1" because slippi ports are 1-indexed while our stationPorts array is 0-indexed

	return (
		slippiSettingsEvent.players.find((p) => p.port - 1 === portNumber) ?? null
	);
};
