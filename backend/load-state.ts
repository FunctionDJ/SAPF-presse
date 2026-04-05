import { type } from "arktype";
import { State, type Station } from "./state";

export const loadState = async (): Promise<typeof State.infer> => {
	const logPrefix = "[loadState]";
	const stateFile = Bun.file("state.json");

	if (await stateFile.exists()) {
		const json = (await stateFile.json()) as unknown;
		const stateValidateResult = State(json);

		if (!(stateValidateResult instanceof type.errors)) {
			console.log(logPrefix, "loaded state.json");

			stateValidateResult.stations.forEach((station) => {
				station.slippi.slippiState.status = "disconnected";
			});

			return stateValidateResult;
		} else {
			console.error(
				logPrefix,
				"state file is invalid:",
				stateValidateResult.summary,
			);
		}
	}

	console.log(logPrefix, "using default state...");

	return {
		stations: [1, 2, 3, 4].map(
			(startggStationNumber): typeof Station.infer => ({
				bestOf: 5,
				startggStationNumber,
				mode: "startgg",
				basicTextOverride: "",
				entrantOverride: [
					{
						player1: {
							tag: "",
							pronouns: "",
							character: null,
							characterColor: null,
						},
						player2: null,
						score: null,
					},
					{
						player1: {
							tag: "",
							pronouns: "",
							character: null,
							characterColor: null,
						},
						player2: null,
						score: null,
					},
				],
				currentSet: null,
				upcomingSets: [],
				ports: [null, null, null, null],
				slippi: {
					ip: "",
					port: 51441,
					slippiState: { status: "disconnected" },
				},
			}),
		),
		centerText: "",
		startggStreamQueueIdToTrack: null,
		startggTournamentId: null,
	};
};
