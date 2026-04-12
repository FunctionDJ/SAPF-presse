import type {
	Character,
	Entrant,
	EntrantInActiveSet,
} from "../../backend/state";

export const entrantsToCharacter = (
	entrant: typeof EntrantInActiveSet.infer,
) => {
	const charactersInScoreboard: (typeof Character.infer)[] = [];

	const pushIfExists = (character: typeof Character.infer | null) => {
		if (character !== null) {
			charactersInScoreboard.push(character);
		}
	};

	pushIfExists(entrant.player1.character);
	pushIfExists(entrant.player2?.character ?? null);

	return charactersInScoreboard;
};

export const entrantToTag = (entrant: typeof Entrant.infer) => {
	let result = entrant.player1.tag.trim() || "(empty)";

	if (entrant.player2) {
		result += " & " + (entrant.player2.tag.trim() || "(empty)");
	}

	return result;
};

export const entrantToPronouns = (entrant: typeof Entrant.infer) => {
	if (
		entrant.player1.pronouns.trim() === "" &&
		(entrant.player2 === null || entrant.player2.pronouns.trim() === "")
	) {
		return "";
	}

	let result = entrant.player1.pronouns.trim() || "n/a";

	if (entrant.player2) {
		result += " & " + (entrant.player2.pronouns.trim() || "n/a");
	}

	return result;
};
