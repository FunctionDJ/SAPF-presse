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
		name: "string",
		team: type({
			id: "number",
			name: "string",
		}).or("null"),
		participants: Participant.array(),
	},
});

export const SetState = type("number").pipe((val) => {
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
	station: {
		number: "number",
	},
	slots: Slot.array(),
	phaseGroup: {
		displayIdentifier: "string",
	},
	state: SetState,
	startedAt: type("number | null").pipe((val) =>
		val === null ? null : new Date(val * 1000),
	),
});

export const Event = type({
	sets: {
		nodes: SetType.array(),
	},
});
