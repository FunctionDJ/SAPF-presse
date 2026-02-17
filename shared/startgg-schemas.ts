import z from "zod/v4";

const standingSchema = z.object({
	stats: z.object({
		score: z.object({
			value: z.number().nullable(),
		}),
	}),
});

export type Standing = z.infer<typeof standingSchema>;

const participantSchema = z.object({
	id: z.number(),
	gamerTag: z.string(),
	prefix: z.string().nullable(),
	user: z
		.object({
			genderPronoun: z.string().nullable(),
		})
		.nullable(),
});

export type Participant = z.infer<typeof participantSchema>;

const entrantSchema = z.object({
	name: z.string(),
	team: z
		.object({
			id: z.number(),
			name: z.string(),
		})
		.nullable(),
	participants: z.array(participantSchema),
});

export type Entrant = z.infer<typeof entrantSchema>;

const slotSchema = z.object({
	slotIndex: z.number(),
	standing: standingSchema,
	entrant: entrantSchema,
});

export type Slot = z.infer<typeof slotSchema>;

const setSchema = z.object({
	id: z.number(),
	station: z.object({
		number: z.number(),
	}),
	slots: z.array(slotSchema),
	phaseGroup: z.object({
		displayIdentifier: z.string(),
	}),
	state: z.number().transform((val) => {
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
	}),
	startedAt: z
		.number()
		.transform((val) => new Date(val * 1000))
		.nullable(),
});

export type TSet = z.infer<typeof setSchema>;

export const eventSchema = z.object({
	sets: z.object({
		nodes: z.array(setSchema),
	}),
});
