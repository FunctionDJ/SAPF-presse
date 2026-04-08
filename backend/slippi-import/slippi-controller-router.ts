import {
	SlpParserEvent,
	type GameEndType,
	type GameStartType,
} from "@slippi/slippi-js/node";
import { TRPCError } from "@trpc/server";
import { type } from "arktype";
import { reportBracketSetBySlippiData } from "../startgg-export/report-bracket-set-by-slippi-data";
import { globalState } from "../state";
import { stationProcedure } from "../station-procedure";
import { router } from "../trpc-server";
import { createSlippiConnectionSet } from "./create-slippi-connectionset";
import { updateStateOnSettingsEvent } from "./update-state-on-settings-event";
import { prefixLogger } from "../logger/logger";

/** maps from stationNumber to connectionSets */
const slippiConnectionSets: Record<
	number,
	ReturnType<typeof createSlippiConnectionSet>
> = {};

for (const station of globalState.stations) {
	slippiConnectionSets[station.startggStationNumber] =
		createSlippiConnectionSet(station.startggStationNumber);
}

const inactiveStationProcedure = stationProcedure.use(({ ctx, next }) => {
	if (
		ctx.station.slippi.slippiState.status === "connected" ||
		ctx.station.slippi.slippiState.status === "connecting"
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: `Station ${ctx.station.startggStationNumber} connected or connecting, can't perform this action`,
		});
	}

	return next();
});

export const slippiRouter = router({
	startStationConnection: inactiveStationProcedure.mutation(async ({ ctx }) => {
		if (ctx.station.slippi.ip.trim() === "") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Station ${ctx.station.startggStationNumber} has invalid IP, can't start connection`,
			});
		}

		const connectionSet =
			slippiConnectionSets[ctx.station.startggStationNumber];

		if (connectionSet === undefined) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `No connection set found for station ${ctx.station.startggStationNumber}`,
			});
		}

		const logger = prefixLogger(
			"SlippiController",
			`Station ${ctx.station.startggStationNumber} at ${ctx.station.slippi.ip}:${ctx.station.slippi.port}`,
		);

		const settingsListener = (settings: GameStartType) => {
			if (settings.players.some((p) => p.type === 1)) {
				// 0 === human, 1 === CPU
				logger.info(`CPU player detected, skipping SETTINGS processing.`);

				return;
			}

			if (settings.players.length !== 2 && settings.players.length !== 4) {
				logger.warn(
					`Uneven number of players (solo practice?), skipping SETTINGS processing.`,
				);

				// TODO this logging is cool and all but i dont think it prevents the system from trying to submit the data to startgg on game end, or how does it currently behave?
				// maybe we need another station/currentSet flag indicating whether a gameend event for a match should trigger a report or not. should it be "doReportOnGameEnd" or a different meaning like "isTournamentMatch"?
				// keep in mind that this flag is for a match, not the whole set, so it may need to be reset on each SETTINGS event, or maybe determined on any SETTINGS event.

				return;
			}

			updateStateOnSettingsEvent(settings, ctx.station.startggStationNumber);

			logger.info(
				`Settings: ${JSON.stringify(
					settings.players.map((p) => ({
						port: p.port,
						characterId: p.characterId,
						displayName: p.displayName,
						connectCode: p.connectCode,
					})),
				)}`,
			);
		};

		connectionSet.parserSettingsListenerReference = settingsListener;
		connectionSet.parser.on(SlpParserEvent.SETTINGS, settingsListener);

		const endListener = (gameEnd: GameEndType) => {
			logger.info("Game end", gameEnd);

			reportBracketSetBySlippiData({
				stationNumber: ctx.station.startggStationNumber,
				gameEnd,
			})
				.catch((error: unknown) => {
					logger.error("Failed to report set", error);
				})
				.finally(() => {
					// parser.reset() is necessary for SlpParserEvent.SETTINGS to be emitted again
					connectionSet.parser.reset();
				});
		};

		connectionSet.parserEndListenerReference = endListener;
		connectionSet.parser.on(SlpParserEvent.END, endListener);

		await connectionSet.conn.connect(
			ctx.station.slippi.ip,
			ctx.station.slippi.port,
			false,
			3,
		);
	}),
	stopStationConnection: stationProcedure.mutation(({ ctx }) => {
		if (
			ctx.station.slippi.slippiState.status !== "connected" &&
			ctx.station.slippi.slippiState.status !== "connecting"
		) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Station ${ctx.station.startggStationNumber} not connected, can't stop connection`,
			});
		}

		const connectionSet =
			slippiConnectionSets[ctx.station.startggStationNumber];

		if (connectionSet === undefined) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `No connection set found for station ${ctx.station.startggStationNumber}`,
			});
		}

		connectionSet.parser.off(
			SlpParserEvent.SETTINGS,
			connectionSet.parserSettingsListenerReference,
		);

		connectionSet.parser.off(
			SlpParserEvent.END,
			connectionSet.parserEndListenerReference,
		);

		connectionSet.conn.disconnect();
		connectionSet.parser.reset(); // next SETTINGS event won't be emitted without resetting the parser
	}),
	resetError: stationProcedure.mutation(({ ctx }) => {
		if (ctx.station.slippi.slippiState.status !== "error") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Station ${ctx.station.startggStationNumber} is not in error state`,
			});
		}

		prefixLogger(
			"SlippiController",
			`Station ${ctx.station.startggStationNumber}`,
		).info(`Resetting error state`);

		ctx.station.slippi.slippiState = { status: "disconnected" };
	}),
	editIp: inactiveStationProcedure
		.input(type({ ip: "string" }))
		.mutation(({ input, ctx }) => {
			prefixLogger(
				"SlippiController",
				`Station ${ctx.station.startggStationNumber}`,
			).info(`Changing IP to ${input.ip}`);

			ctx.station.slippi.ip = input.ip;
		}),
	editPort: inactiveStationProcedure
		.input(type({ port: "number" }))
		.mutation(({ input, ctx }) => {
			prefixLogger(
				"SlippiController",
				`Station ${ctx.station.startggStationNumber}`,
			).info(`Changing port to ${input.port}`);

			ctx.station.slippi.port = input.port;
		}),
});
