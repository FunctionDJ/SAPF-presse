import { type } from "arktype";
import { State, type Station } from "./state";
import { prefixLogger } from "./logger";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const loadState = async (): Promise<typeof State.infer> => {
	const logger = prefixLogger("LoadState");
	const stateFile = Bun.file("state.json");

	if (await stateFile.exists()) {
		let json;

		try {
			json = (await stateFile.json()) as unknown;

		} catch (error) {
			try {
				const text = await stateFile.text()
				json = JSON.parse(text.slice(0, -2)) // "} weirdness
			} catch (error) {
				console.error("ja es ist das hier")
			}
		}

		if (isRecord(json)) {
			const { stations } = json;

			if (Array.isArray(stations)) {
				for (const maybeStation of stations) {
					if (!isRecord(maybeStation)) {
						continue;
					}
					const station = maybeStation;

					if (typeof station.commentators !== "string") {
						station.commentators = "";
					}

					if (typeof station.highlighted !== "boolean") {
						station.highlighted = false;
					}

					if (
						isRecord(station.slippi) &&
						typeof station.slippi.shouldReportSetOnGameEnd !== "boolean"
					) {
						station.slippi.shouldReportSetOnGameEnd = false;
					}
				}
			}
		}

		const stateValidateResult = State(json);

		if (stateValidateResult instanceof type.errors) {
			logger.error(`state file is invalid: ${stateValidateResult.summary}`);
		} else {
			logger.info("loaded state.json");

			for (const station of stateValidateResult.stations) {
				station.slippi.slippiState.status = "disconnected";
				station.slippi.shouldReportSetOnGameEnd = false;
			}

			return stateValidateResult;
		}
	}

	logger.info("using default state...");

	return {
		stations: [1, 2, 3, 4].map(
			(startggStationNumber): typeof Station.infer => ({
				bestOf: 5,
				startggStationNumber,
				commentators: "",
				highlighted: false,
				mode: "startgg",
				basicTextOverride: "",
				entrantOverride: {
					entrantA: {
						player1: {
							tag: "",
							pronouns: "",
							character: null,
						},
						player2: null,
						score: null,
					},
					entrantB: {
						player1: {
							tag: "",
							pronouns: "",
							character: null,
						},
						player2: null,
						score: null,
					},
				},
				currentSet: null,
				upcomingSets: [],
				ports: [null, null, null, null],
				slippi: {
					ip: "",
					port: 51441,
					shouldReportSetOnGameEnd: false,
					slippiState: { status: "disconnected" },
				},
			}),
		),
		centerText: "",
		startggStreamQueueIdToTrack: null,
		startggTournamentId: null,
		startggTournamentSlug: null,
	};
};
