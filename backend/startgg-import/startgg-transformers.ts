import type { Participant, Slot, SetType, Event } from "./startgg-schemas";
import type {
	CurrentSet,
	EntrantInCurrentSet,
	EntrantInUpcomingSet,
	PlayerInCurrentSet,
	PlayerInUpcomingSet,
	Station,
	UpcomingSet,
} from "../state";

const participantToPlayerInCurrentSet = (
	participant: typeof Participant.infer,
): PlayerInCurrentSet => ({
	startggParticipantId: participant.id,
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
	character: null,
	characterColor: null,
});

const slotToCurrentSetEntrant = (
	slot: typeof Slot.infer,
): EntrantInCurrentSet => ({
	startggEntrantId: slot.entrant.id,
	score: slot.standing.stats.score.value ?? null,
	player1: slot.entrant.participants[0]
		? participantToPlayerInCurrentSet(slot.entrant.participants[0])
		: {
				startggParticipantId: null,
				tag: "[missing participant]",
				pronouns: "",
				character: null,
				characterColor: null,
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInCurrentSet(slot.entrant.participants[1])
		: null,
});

const participantToPlayerInUpcomingSet = (
	participant: typeof Participant.infer,
): PlayerInUpcomingSet => ({
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
});

const slotToUpcomingSetEntrant = (
	slot: typeof Slot.infer,
): EntrantInUpcomingSet => ({
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

const setToCurrentSet = (set: typeof SetType.infer): CurrentSet => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		state: set.state,
		phaseGroupDisplayIdentifier: set.phaseGroup.displayIdentifier,
		startedAt: set.startedAt ? new Date(set.startedAt) : null,
		stage: null,
		entrantA: slotToCurrentSetEntrant(slotA),
		entrantB: slotToCurrentSetEntrant(slotB),
	};
};

const setToUpcomingSet = (set: typeof SetType.infer): UpcomingSet => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		state: set.state,
		phaseGroupDisplayIdentifier: set.phaseGroup.displayIdentifier,
		entrantA: slotToUpcomingSetEntrant(slotA),
		entrantB: slotToUpcomingSetEntrant(slotB),
	};
};

export const getNewStationByEvents = (
	oldStation: Station,
	events: (typeof Event.infer)[],
): Station => {
	const sggSetsAtThisStation = events.flatMap((event) =>
		event.sets.nodes.filter(
			(set) => set.station.number === oldStation.startggStationNumber,
		),
	);

	const currentSGGSet = sggSetsAtThisStation.find(
		(set) => set.state === "active",
	);

	const stationClone = { ...oldStation };

	// update current set if id changed
	if (
		currentSGGSet !== undefined &&
		currentSGGSet.id !== stationClone.currentSet?.startggSetId
	) {
		stationClone.currentSet = setToCurrentSet(currentSGGSet);
	} else {
		// update score

		const { currentSet } = stationClone;

		if (currentSet === null) {
			console.warn("Station has no currentSet in state, skipping score update");
			return stationClone;
		}

		if (currentSGGSet === undefined) {
			console.warn(
				"Station has currentSet, but no active set (startgg) at this station, skipping score update",
			);
			return stationClone;
		}

		const [slotA, slotB] = getSlotsFromSetOrThrow(currentSGGSet);
		const valueA = slotA.standing.stats.score.value;
		const valueB = slotB.standing.stats.score.value;

		if (valueA === null || valueB === null) {
			console.warn(
				"Score value of startgg active set is null for one of the slots, skipping score update",
			);
			return stationClone;
		}

		currentSet.entrantA.score = valueA;
		currentSet.entrantB.score = valueB;
	}

	stationClone.upcomingSets = sggSetsAtThisStation
		.filter((set) => set.id !== stationClone.currentSet?.startggSetId)
		.map(setToUpcomingSet);

	return stationClone;
};
