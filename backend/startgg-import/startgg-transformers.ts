import { prefixLogger } from "../logger";
import type {
	CurrentSet,
	Entrant,
	EntrantInActiveStartGGSet,
	Player,
	PlayerInActiveStartGGSet,
	Station,
	UpcomingSet,
} from "../state";
import type { Participant, SetType, Slot } from "./startgg-schemas";

const participantToPlayerInCurrentSet = (
	participant: typeof Participant.infer,
): typeof PlayerInActiveStartGGSet.infer => ({
	startggParticipantId: participant.id,
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
	character: null,
});

const slotToCurrentSetEntrant = (
	slot: typeof Slot.infer,
): typeof EntrantInActiveStartGGSet.infer => ({
	startggEntrantId: slot.entrant.id,
	score: slot.standing.stats.score.value ?? 0,
	player1: slot.entrant.participants[0]
		? participantToPlayerInCurrentSet(slot.entrant.participants[0])
		: {
				startggParticipantId: null,
				tag: "[missing participant]",
				pronouns: "",
				character: null,
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInCurrentSet(slot.entrant.participants[1])
		: null,
});

const participantToPlayerInUpcomingSet = (
	participant: typeof Participant.infer,
): typeof Player.infer => ({
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
});

const slotToUpcomingSetEntrant = (
	slot: typeof Slot.infer,
): typeof Entrant.infer => ({
	player1: slot.entrant.participants[0]
		? participantToPlayerInUpcomingSet(slot.entrant.participants[0])
		: {
				tag: "[missing participant]",
				pronouns: "",
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInUpcomingSet(slot.entrant.participants[1])
		: null,
});

const getSlotsFromSetOrThrow = (set: typeof SetType.infer) => {
	const [slotA, slotB] = set.slots;

	if (slotA === undefined || slotB === undefined) {
		throw new Error(
			`Expected 2 slots for set ${set.id}, but got ${set.slots.length}`,
		);
	}

	return [slotA, slotB] as const;
};

const setToCurrentSet = (
	set: typeof SetType.infer,
): typeof CurrentSet.infer => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		fullRoundText: set.fullRoundText,
		round: set.round,
		state: set.state,
		phaseGroup: set.phaseGroup,
		startedAt: set.startedAt ? new Date(set.startedAt) : null,
		slippiStage: null,
		entrantA: slotToCurrentSetEntrant(slotA),
		entrantB: slotToCurrentSetEntrant(slotB),
	};
};

const setToUpcomingSet = (
	set: typeof SetType.infer,
): typeof UpcomingSet.infer => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		fullRoundText: set.fullRoundText,
		round: set.round,
		state: set.state,
		phaseGroup: set.phaseGroup,
		entrantA: slotToUpcomingSetEntrant(slotA),
		entrantB: slotToUpcomingSetEntrant(slotB),
	};
};

export const transformStationByStreamQueueSets = (
	station: typeof Station.infer,
	allSetsInStreamQueue: (typeof SetType.infer)[],
) => {
	const logger = prefixLogger(
		"StartggImport",
		`Station ${station.startggStationNumber}`,
	);

	const sggSetsAtThisStation = allSetsInStreamQueue.filter(
		(set) =>
			set.station.number === station.startggStationNumber &&
			set.state !== "invalid",
	);

	station.upcomingSets = sggSetsAtThisStation
		.filter(
			(set) =>
				set.id !== station.currentSet?.startggSetId && set.state === "queued",
		)
		.map((set) => setToUpcomingSet(set));

	const activeSSGSetsAtThisStation = sggSetsAtThisStation.filter(
		(set) => set.state === "active",
	);

	if (activeSSGSetsAtThisStation.length > 1) {
		// [FUTURE] customize and explain this issue more accurately for the different scenarios, i.e. if currentSet is in queue or not

		logger.warn(
			`Found multiple active sets at this station in the stream queue.`,
		);
	}

	// if the currentSet.id is in the stream queue and active, then we update it

	const { currentSet } = station;

	if (currentSet !== null) {
		const ssgSetLastKnownSet = sggSetsAtThisStation.find(
			(set) => set.id === currentSet.startggSetId,
		);

		// TODO we want to have a feature where when a set finished, the currentSet lingers around for like a 30 seconds till a minute, so maybe we expand the currentSet to include a finishedAt field and only override it once the time has passed

		if (ssgSetLastKnownSet === undefined) {
			logger.info(`Current set not found in the stream queue`);
		} else {
			const [slotA, slotB] = getSlotsFromSetOrThrow(ssgSetLastKnownSet);
			currentSet.state = ssgSetLastKnownSet.state;
			currentSet.entrantA.score = slotA.standing.stats.score.value ?? 0;
			currentSet.entrantB.score = slotB.standing.stats.score.value ?? 0;
			return;
		}
	}

	// either there's no currentSet, or it's not in the queue anymore, so we pull the next set from the queue
	// the startgg set we adopt as currentSet is the station+queue's first active set, or is none are active, the station+queue's first set

	const ssgSetToAdopt =
		activeSSGSetsAtThisStation[0] ?? sggSetsAtThisStation[0];

	if (ssgSetToAdopt === undefined) {
		if (currentSet !== null) {
			logger.warn(
				`No sets in the stream queue for this station, setting currentSet to null.`,
			);

			station.currentSet = null;
			station.ports = [null, null, null, null];
		}

		return;
	}

	logger.info(
		`Adopting set ${ssgSetToAdopt.id} as current set for this station`,
	);

	station.currentSet = setToCurrentSet(ssgSetToAdopt);
	station.ports = [null, null, null, null];
};
