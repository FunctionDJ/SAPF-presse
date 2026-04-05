import type {
	CurrentSet,
	EntrantInCurrentSet,
	EntrantInUpcomingSet,
	PlayerInCurrentSet,
	PlayerInUpcomingSet,
	Station,
	UpcomingSet,
} from "../state";
import type { Participant, SetType, Slot } from "./startgg-schemas";

const participantToPlayerInCurrentSet = (
	participant: typeof Participant.infer,
): typeof PlayerInCurrentSet.infer => ({
	startggParticipantId: participant.id,
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
	slippiCharacterId: null,
	slippiCharacterColorId: null,
});

const slotToCurrentSetEntrant = (
	slot: typeof Slot.infer,
): typeof EntrantInCurrentSet.infer => ({
	startggEntrantId: slot.entrant.id,
	score: slot.standing.stats.score.value ?? null,
	player1: slot.entrant.participants[0]
		? participantToPlayerInCurrentSet(slot.entrant.participants[0])
		: {
				startggParticipantId: null,
				tag: "[missing participant]",
				pronouns: "",
				slippiCharacterId: null,
				slippiCharacterColorId: null,
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInCurrentSet(slot.entrant.participants[1])
		: null,
});

const participantToPlayerInUpcomingSet = (
	participant: typeof Participant.infer,
): typeof PlayerInUpcomingSet.infer => ({
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
});

const slotToUpcomingSetEntrant = (
	slot: typeof Slot.infer,
): typeof EntrantInUpcomingSet.infer => ({
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
		state: set.state,
		phaseGroupDisplayIdentifier: set.phaseGroup.displayIdentifier,
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
		state: set.state,
		phaseGroupDisplayIdentifier: set.phaseGroup.displayIdentifier,
		entrantA: slotToUpcomingSetEntrant(slotA),
		entrantB: slotToUpcomingSetEntrant(slotB),
	};
};

export const getNewStationByStreamQueueSets = (
	oldStation: typeof Station.infer,
	allSetsInStreamQueue: (typeof SetType.infer)[],
): typeof Station.infer => {
	const logPrefix = `[StartggImport] [Station ${oldStation.startggStationNumber}]`;

	// TODO

	/**
	 * i think this place also needs some code to handle filtering all station sets to those that are on the stream queue
	 */

	const sggSetsAtThisStation = allSetsInStreamQueue.filter(
		(set) => set.station.number === oldStation.startggStationNumber,
	);

	// TODO

	/**
	 * for example the below code is probably actually wrong because it should just do
	 * "from the stream queue, take the top set at this station" and ignore the set state.
	 */

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
			// this case is shown via dashboard as "no current set in state"
			return stationClone;
		}

		if (currentSGGSet === undefined) {
			console.warn(
				`${logPrefix} Station has currentSet, but no active set (startgg) at this station, skipping score update`,
			);
			return stationClone;
		}

		const [slotA, slotB] = getSlotsFromSetOrThrow(currentSGGSet);
		const valueA = slotA.standing.stats.score.value;
		const valueB = slotB.standing.stats.score.value;

		currentSet.entrantA.score = valueA;
		currentSet.entrantB.score = valueB;
	}

	stationClone.upcomingSets = sggSetsAtThisStation
		.filter((set) => set.id !== stationClone.currentSet?.startggSetId)
		.map(setToUpcomingSet);

	return stationClone;
};
