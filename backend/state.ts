import type { Stage } from "@slippi/slippi-js/node";
import { type } from "arktype";
import { EventEmitter } from "node:stream";
import type { SetState } from "./startgg-import/startgg-schemas";

export const PlayerInCurrentSet = type({
	startggParticipantId: "number|null",
	tag: "string",
	pronouns: "string",
	character: type("number|null"),
	characterColor: type("number|null"),
});

export type PlayerInCurrentSet = typeof PlayerInCurrentSet.infer;

export interface PlayerInUpcomingSet {
	tag: string;
	pronouns: string;
}

export interface EntrantInCurrentSet {
	startggEntrantId: number;
	player1: PlayerInCurrentSet;
	player2: PlayerInCurrentSet | null;
	score: number | null;
}

export interface CurrentSet {
	startggSetId: number;
	state: typeof SetState.infer;
	phaseGroupDisplayIdentifier: string | null;
	startedAt: Date | null;
	entrantA: EntrantInCurrentSet;
	entrantB: EntrantInCurrentSet;
	stage: Stage | null;
}

export interface EntrantInUpcomingSet {
	player1: PlayerInUpcomingSet;
	player2: PlayerInUpcomingSet | null;
}

export interface UpcomingSet {
	startggSetId: number;
	state: typeof SetState.infer;
	phaseGroupDisplayIdentifier: string | null;
	entrantA: EntrantInUpcomingSet;
	entrantB: EntrantInUpcomingSet;
}

/** startgg player id or null (no player) */
const Port = type("number|null");

export const Ports = type([Port, Port, Port, Port]);

export const Mode = type("'basic-text-override'|'players-override'|'startgg'");

export interface Station {
	bestOf: number;
	startggStationNumber: number;
	mode: typeof Mode.infer;
	basicTextOverride: string;
	playersOverride: PlayerInCurrentSet[];
	currentSet: CurrentSet | null;
	upcomingSets: UpcomingSet[];
	ports: typeof Ports.infer;
	// TODO implement
	slippiStatus: unknown;
}

export interface State {
	stations: Station[];
	centerText: string;
}

// TODO state speichern? was wenn prozess crasht? was ist mit den ports, overrides etc?

export const state: State = {
	stations: [],
	centerText: "",
};

export const emitter = new EventEmitter();

export const signalUpdate = () => {
	emitter.emit("data", state);
};
