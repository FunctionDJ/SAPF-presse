import { type } from "arktype";
import { router } from "../trpc-server";
import { TRPCError } from "@trpc/server";
import {
	ConnectionEvent,
	ConnectionStatus,
	ConsoleConnection,
	SlpParser,
	SlpParserEvent,
	SlpStream,
	SlpStreamEvent,
	type GameEndType,
	type GameStartType,
} from "@slippi/slippi-js/node";
import { startReplayWriter } from "../replay-export/replay-export";
import {
	globalState,
	updateStateSync,
	updateStationSync,
	type Station,
} from "../state";
import { updateStateOnSettingsEvent } from "./update-state-on-settings-event";
import { reportBracketSetBySlippiData } from "../startgg-export/report-bracket-set-by-slippi-data";
import { stationProcedure } from "../station-procedure";

// TODO maybe we should just use ConnectionStatus directly for state instead of having to do mapping

const statusMap = {
	[ConnectionStatus.CONNECTING]: "connecting",
	[ConnectionStatus.CONNECTED]: "connected",
	[ConnectionStatus.DISCONNECTED]: "disconnected",
	[ConnectionStatus.RECONNECT_WAIT]: "reconnect-wait",
} satisfies Record<
	ConnectionStatus,
	typeof Station.infer.slippi.slippiState.status
>;

const createSlippiConnectionSet = (stationNumber: number) => {
	const conn = new ConsoleConnection({ autoReconnect: true });
	const stream = new SlpStream();
	const parser = new SlpParser();

	conn.on(ConnectionEvent.STATUS_CHANGE, (newSlippiStatus) => {
		const newStationSlippiStatus = statusMap[newSlippiStatus];

		console.log(
			`[SlippiController] [Station ${stationNumber} at ${conn.getSettings().ipAddress}:${conn.getSettings().port}] New status: ${newStationSlippiStatus}`,
		);

		updateStationSync(stationNumber, (station) => {
			if (newStationSlippiStatus === "connected") {
				station.slippi.slippiState = {
					status: "connected",
					consoleNick: conn.getDetails().consoleNick,
					version: conn.getDetails().version,
				};
			} else {
				station.slippi.slippiState = { status: newStationSlippiStatus };
			}
		});
	});

	conn.on(ConnectionEvent.ERROR, (err) => {
		console.error(
			`[SlippiController] [Station ${stationNumber} at ${conn.getSettings().ipAddress}:${conn.getSettings().port}] Connection error:`,
			err,
		);

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState = {
				status: "error",
				errorMessage: "Connection error: " + String(err),
			};
		});
	});

	conn.on(ConnectionEvent.DATA, (data) => stream.process(data));

	stream.on(SlpStreamEvent.COMMAND, ({ command, payload }) =>
		parser.handleCommand(command, payload),
	);

	startReplayWriter(stream, stationNumber);

	return {
		conn,
		stream,
		parser,
		/**
		 * the following two are function references that we need to store
		 * so that we can unregister them when registering new ones
		 * when the connection is stopped/started.
		 */
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parserSettingsListenerReference: (_settings: GameStartType) => {
			/* empty */
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parserEndListenerReference: (_gameEnd: GameEndType) => {
			/* empty */
		},
	};
};

/** maps from stationNumber to connectionSets */
const slippiConnectionSets: Record<
	number,
	ReturnType<typeof createSlippiConnectionSet>
> = globalState.stations.reduce(
	(acc, station) => ({
		...acc,
		[station.startggStationNumber]: createSlippiConnectionSet(
			station.startggStationNumber,
		),
	}),
	{},
);

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

		const logPrefix = `[SlippiController] [Station ${ctx.station.startggStationNumber} at ${ctx.station.slippi.ip}:${ctx.station.slippi.port}]`;

		const settingsListener = (settings: GameStartType) => {
			if (settings.players.some((p) => p.type === 1)) {
				// 0 === human, 1 === CPU
				console.log(
					`${logPrefix} CPU player detected, skipping SETTINGS processing.`,
				);
				return;
			}

			if (settings.players.length !== 2 && settings.players.length !== 4) {
				console.log(
					`${logPrefix} Uneven number of players (solo practice?), skipping SETTINGS processing.`,
				);

				// TODO this logging is cool and all but i dont think it prevents the system from trying to submit the data to startgg on game end, or how does it currently behave?
				// maybe we need another station/currentSet flag indicating whether a gameend event for a match should trigger a report or not. should it be "doReportOnGameEnd" or a different meaning like "isTournamentMatch"?
				// keep in mind that this flag is for a match, not the whole set, so it may need to be reset on each SETTINGS event, or maybe determined on any SETTINGS event.

				return;
			}

			updateStateOnSettingsEvent(
				logPrefix,
				settings,
				ctx.station.startggStationNumber,
			);

			console.log(
				`${logPrefix} Settings:`,
				settings.players.map((p) => ({
					port: p.port,
					characterId: p.characterId,
					displayName: p.displayName,
					connectCode: p.connectCode,
				})),
			);
		};

		connectionSet.parserSettingsListenerReference = settingsListener;
		connectionSet.parser.on(SlpParserEvent.SETTINGS, settingsListener);

		const endListener = (gameEnd: GameEndType) => {
			console.log(`${logPrefix} Game end data:`, gameEnd);

			reportBracketSetBySlippiData({
				stationNumber: ctx.station.startggStationNumber,
				gameEnd,
			})
				.catch((err: unknown) => {
					console.error(`${logPrefix} Failed to report set:`, err);
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
		connectionSet.parser.reset(); // next SETTINGS event won't be emitted without this
		connectionSet.stream.restart(); // TODO unsure if necessary
	}),
	resetError: stationProcedure.mutation(({ ctx }) => {
		if (ctx.station.slippi.slippiState.status !== "error") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Station ${ctx.station.startggStationNumber} is not in error state`,
			});
		}

		console.log(
			`[SlippiController] [Station ${ctx.station.startggStationNumber}] Resetting error state`,
		);

		ctx.station.slippi.slippiState = { status: "disconnected" };
	}),
	editIp: inactiveStationProcedure
		.input(type({ ip: "string" }))
		.mutation(({ input, ctx }) => {
			console.log(
				`[SlippiController] [Station ${ctx.station.startggStationNumber}] Changing IP to ${input.ip}`,
			);

			ctx.station.slippi.ip = input.ip;
		}),
	editPort: inactiveStationProcedure
		.input(type({ port: "number" }))
		.mutation(({ input, ctx }) => {
			console.log(
				`[SlippiController] [Station ${ctx.station.startggStationNumber}] Changing port to ${input.port}`,
			);

			ctx.station.slippi.port = input.port;
		}),
});
