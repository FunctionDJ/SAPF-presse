import { type } from "arktype";

export const Participant = type({
	id: "number",
	gamerTag: "string",
	prefix: "string | null",
	user: type({
		genderPronoun: "string | null",
	}).or("null"),
});

export const Slot = type({
	slotIndex: "number",
	standing: type({
		stats: {
			score: {
				value: "number | null",
			},
		},
	}).or("null"),
	entrant: type({
		id: "number",
		name: "string",
		team: type({
			id: "number",
			name: "string",
		}).or("null"),
		participants: Participant.array(),
	}).or("null"),
});

const SetStateFromStartgg = type("number").pipe((value) => {
	switch (value) {
		case 1: {
			return "created";
		}
		case 2: {
			return "active";
		}
		case 3: {
			return "completed";
		}
		case 4: {
			return "ready";
		}
		case 5: {
			return "invalid";
		}
		case 6: {
			return "called";
		}
		case 7: {
			return "queued";
		}
		default: {
			return "unknown";
		}
	}
});

export const PhaseGroup = type({
	displayIdentifier: "string",
	/** we actually only care about DOUBLE_ELIMINATION and ROUND_ROBIN for pools */
	bracketType: type.or(
		"'SINGLE_ELIMINATION'",
		"'DOUBLE_ELIMINATION'",
		"'ROUND_ROBIN'",
		"'SWISS'",
		"'EXHIBITION'",
		"'CUSTOM_SCHEDULE'",
		"'MATCHMAKING'",
		"'ELIMINATION_ROUNDS'",
		"'RACE'",
		"'CIRCUIT'",
	),
});

/** negative = losers side */
export const SetRound = type("number.integer");

export const SetType = type({
	id: "number",
	round: SetRound,
	fullRoundText: "string",
	station: type({
		number: "number",
	}).or("null"),
	slots: Slot.array(),
	phaseGroup: PhaseGroup,
	state: SetStateFromStartgg,
	startedAt: type("number | null").pipe((value) =>
		value === null ? null : new Date(value * 1000),
	),
});
