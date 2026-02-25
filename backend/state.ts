import { on } from "node:events";
import { EventEmitter } from "node:stream";
import type { SetState } from "../shared/schema-utils";

type Players = {
	tag: string;
	pronouns: string;
	stockIcon: string;
	score: number | null;
}[];

interface CurrentSet {
	id: number;
	state: typeof SetState.infer;
	phaseGroupDisplayIdentifier: string | null;
	startedAt: Date | null;
	players: Players;
}

// TODO this is a mess
// slippi data only applies to current set
interface UpcomingSet {
	id: number;
	state: typeof SetState.infer;
	phaseGroupDisplayIdentifier: string | null;
	leftEntrant: {
		name: string;
		pronouns: string;
	};
}

interface Station {
	id: number;
	mode: "basic-text-override" | "players-override" | "startgg";
	basicText: string;
	playersOverride: Players;
	upcomingSets: StartggAndSlippiSet[];
	ports: (number | null)[];
}

interface State {
	stations: Station[];
	centerText: string;
}

let state: State = {
	stations: [],
	centerText: "",
};

const emitter = new EventEmitter();

export const updateState = (patchFn: (oldState: State) => State) => {
	state = patchFn(state);
	emitter.emit("data", state);
};

export const emitterIterator = on(emitter, "data") as AsyncIterator<State>;
