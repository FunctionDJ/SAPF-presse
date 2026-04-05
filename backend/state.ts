import { type } from "arktype";
import { EventEmitter } from "node:events";
import { loadState } from "./load-state";

export const PlayerInCurrentSet = type({
	startggParticipantId: "number|null",
	tag: "string",
	pronouns: "string",
	slippiCharacterId: type("number|null"),
	slippiCharacterColorId: type("number|null"),
});

export const PlayerInUpcomingSet = type({
	tag: "string",
	pronouns: "string",
});

export const EntrantInCurrentSet = type({
	startggEntrantId: "number",
	player1: PlayerInCurrentSet,
	player2: type(PlayerInCurrentSet.or("null")),
	score: type("number|null"),
});

const OverridePlayer = type({
	tag: "string",
	pronouns: "string",
	character: type("number|null"),
	// TODO implement characterColor in frontend
	characterColor: type("number|null"),
});

export const OverrideEntrant = type({
	player1: OverridePlayer,
	player2: type(OverridePlayer.or("null")),
	score: type("number|null"),
});

const SetState = type(
	"'created'|'active'|'completed'|'ready'|'invalid'|'called'|'queued'|'unknown'",
);

export const CurrentSet = type({
	startggSetId: "number",
	state: SetState,
	phaseGroupDisplayIdentifier: "string|null",
	// we need to allow string here because state gets serialized to JSON for file storage
	// (network/tRPC transmission is handled by superjson)
	startedAt: type("string|Date|null").pipe((val) =>
		val === null ? null : new Date(val),
	),
	entrantA: EntrantInCurrentSet,
	entrantB: EntrantInCurrentSet,
	slippiStage: "number|null",
});

export const EntrantInUpcomingSet = type({
	player1: PlayerInUpcomingSet,
	player2: type(PlayerInUpcomingSet.or("null")),
});

export const UpcomingSet = type({
	startggSetId: "number",
	state: SetState,
	phaseGroupDisplayIdentifier: "string|null",
	entrantA: EntrantInUpcomingSet,
	entrantB: EntrantInUpcomingSet,
});

/** startgg player id or null (no player) */
const Port = type("number|null");

export const Ports = type([Port, Port, Port, Port]);

export const Mode = type("'basic-text-override'|'entrant-override'|'startgg'");

export const Station = type({
	bestOf: "number",
	startggStationNumber: "number",
	mode: Mode,
	basicTextOverride: "string",
	entrantOverride: [OverrideEntrant, OverrideEntrant],
	currentSet: type(CurrentSet.or("null")),
	upcomingSets: UpcomingSet.array(),
	ports: Ports,
	slippi: type({
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
	}),
});

export const State = type({
	stations: Station.array(),
	centerText: "string",
	/** determines from which stream queue to pull the sets from */
	startggStreamQueueIdToTrack: "string|null",
	startggTournamentId: "number.integer|null",
});

export const globalState = await loadState();

export const emitter = new EventEmitter();

export const updateStateSync = (
	updater: (state: typeof State.infer) => void,
) => {
	const oldState = JSON.stringify(globalState);
	updater(globalState);
	const newState = JSON.stringify(globalState);

	if (oldState !== newState) {
		emitter.emit("data", globalState);
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
		emitter.emit("data", globalState);
		void Bun.write("state.json", new Blob([newState]));
	}

	return result;
};

export const getStationOrThrow = (stationNumber: number) => {
	const station = globalState.stations.find(
		(s) => s.startggStationNumber === stationNumber,
	);

	if (!station) {
		throw new Error(`Station with number ${stationNumber} not found`);
	}

	return station;
};

export const updateStationSync = (
	stationNumber: number,
	updater: (station: typeof Station.infer) => void,
) => {
	updateStateSync((state) => {
		const station = state.stations.find(
			(s) => s.startggStationNumber === stationNumber,
		);

		if (!station) {
			throw new Error(`[State] Station with number ${stationNumber} not found`);
		}

		updater(station);
	});
};
