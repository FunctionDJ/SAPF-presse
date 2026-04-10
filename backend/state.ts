import { type } from "arktype";
import { loadState } from "./load-state";
import { PhaseGroup, SetRound } from "./startgg-import/startgg-schemas";

export const Character = type({
	slippiCharacterId: "number",
	slippiCharacterColorId: "number",
});

export const Player = type({
	tag: "string",
	pronouns: "string",
});

export const Entrant = type({
	player1: Player,
	player2: Player.or("null"),
});

export const PlayerWithCharacter = Player.and({
	character: Character.or("null"),
});

export const PlayerInActiveStartGGSet = PlayerWithCharacter.and({
	startggParticipantId: "number|null",
});

export const EntrantInActiveStartGGSet = type({
	startggEntrantId: "number",
	player1: PlayerInActiveStartGGSet,
	player2: PlayerInActiveStartGGSet.or("null"),
	score: "number",
});

export const EntrantInActiveSet = type({
	player1: PlayerWithCharacter,
	player2: PlayerWithCharacter.or("null"),
	score: "number|null",
});

export type EntrantInAnyActiveSet =
	| typeof EntrantInActiveStartGGSet.infer
	| typeof EntrantInActiveSet.infer;

const SetState = type(
	"'created'|'active'|'completed'|'ready'|'invalid'|'called'|'queued'|'unknown'",
);

export const CurrentSet = type({
	startggSetId: "number",
	round: SetRound,
	fullRoundText: "string",
	state: SetState,
	phaseGroup: PhaseGroup,
	// we need to allow string here because state gets serialized to JSON for file storage
	// (network/tRPC transmission is handled by superjson)
	startedAt: type("string|Date|null").pipe((value) =>
		value === null ? null : new Date(value),
	),
	entrantA: EntrantInActiveStartGGSet,
	entrantB: EntrantInActiveStartGGSet,
	slippiStage: "number|null",
});

export const UpcomingSet = type({
	startggSetId: "number",
	round: SetRound,
	fullRoundText: "string",
	state: SetState,
	phaseGroup: PhaseGroup,
	entrantA: Entrant,
	entrantB: Entrant,
});

/** startgg player id or null (no player) */
const Port = type("number|null");

export const Ports = type([Port, Port, Port, Port]);

export const Mode = type("'basic-text-override'|'entrant-override'|'startgg'");

export const EntrantOverrides = type({
	entrantA: EntrantInActiveSet,
	entrantB: EntrantInActiveSet,
});

export const Station = type({
	bestOf: "number",
	startggStationNumber: "number",
	mode: Mode,
	basicTextOverride: "string",
	entrantOverride: EntrantOverrides,
	currentSet: CurrentSet.or("null"),
	upcomingSets: UpcomingSet.array(),
	ports: Ports,
	slippi: {
		ip: "string",
		port: "number",
		slippiState: type.or(
			{
				status: "'disconnected'",
			},
			{
				status: "'connecting'",
			},
			{
				status: "'connected'",
				consoleNick: "string",
				version: "string",
			},
			{
				status: "'reconnect-wait'",
			},
			{
				status: "'error'",
				errorMessage: "string",
			},
		),
	},
});

export const State = type({
	stations: Station.array(),
	centerText: "string",
	/** determines from which stream queue to pull the sets from */
	startggStreamQueueIdToTrack: "string|null",
	startggTournamentId: "number.integer|null",
	startggTournamentSlug: "string|null",
});

export const globalState = await loadState();

export const emitter = new EventTarget();

export const updateStateSync = (
	updater: (state: typeof State.infer) => void,
) => {
	const oldState = JSON.stringify(globalState);
	updater(globalState);
	const newState = JSON.stringify(globalState);

	if (oldState !== newState) {
		emitter.dispatchEvent(new CustomEvent("data", { detail: globalState }));
		void Bun.write("state.json", new Blob([newState]));
	}
};

/** this function is generic so it can be used to wrap tRPC `next()` */
export const updateStateAsync = async <T>(
	updater: (state: typeof State.infer) => Promise<T>,
) => {
	const oldState = JSON.stringify(globalState);
	const result = await updater(globalState);
	const newState = JSON.stringify(globalState);

	if (oldState !== newState) {
		emitter.dispatchEvent(new CustomEvent("data", { detail: globalState }));
		void Bun.write("state.json", new Blob([newState]));
	}

	return result;
};

export const getStationOrThrow = (stationNumber: number) => {
	const station = globalState.stations.find(
		(s) => s.startggStationNumber === stationNumber,
	);

	if (!station) {
		throw new Error(`[State] Station with number ${stationNumber} not found`);
	}

	return station;
};

export const updateStationSync = (
	stationNumber: number,
	updater: (station: typeof Station.infer) => void,
) => {
	updateStateSync(() => {
		updater(getStationOrThrow(stationNumber));
	});
};
