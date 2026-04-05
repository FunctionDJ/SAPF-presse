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
	standing: {
		stats: {
			score: {
				value: "number | null",
			},
		},
	},
	entrant: {
		id: "number",
		name: "string",
		team: type({
			id: "number",
			name: "string",
		}).or("null"),
		participants: Participant.array(),
	},
});

const SetStateFromStartgg = type("number").pipe((val) => {
	switch (val) {
		case 1:
			return "created";
		case 2:
			return "active";
		case 3:
			return "completed";
		case 4:
			return "ready";
		case 5:
			return "invalid";
		case 6:
			return "called";
		case 7:
			return "queued";
		default:
			return "unknown";
	}
});

export const SetType = type({
	id: "number",
	/** negative = losers side */
	round: "number.integer",
	station: {
		number: "number",
	},
	slots: Slot.array(),
	phaseGroup: {
		displayIdentifier: "string",
		numRounds: "number.integer",
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
	},
	state: SetStateFromStartgg,
	startedAt: type("number | null").pipe((val) =>
		val === null ? null : new Date(val * 1000),
	),
});
