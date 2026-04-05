import type { PlayerType } from "@slippi/slippi-js/node";
import type { PlayerInCurrentSet } from "../state";

export const applyPlayerTypeToState = (
	playerInCurrentSet: typeof PlayerInCurrentSet.infer,
	playerType: PlayerType,
) => {
	playerInCurrentSet.slippiCharacterId = playerType.characterId ?? null;
	playerInCurrentSet.slippiCharacterColorId = playerType.characterColor ?? null;
};
