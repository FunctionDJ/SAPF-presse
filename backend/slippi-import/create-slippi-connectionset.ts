import {
	ConnectionEvent,
	ConnectionStatus,
	ConsoleConnection,
	SlpParser,
	SlpStream,
	SlpStreamEvent,
	type GameEndType,
	type GameStartType,
} from "@slippi/slippi-js/node";
import { startReplayWriter } from "../replay-export/replay-export";
import { updateStationSync, type Station } from "../state";
import { prefixLogger } from "../logger";

// [FUTURE] maybe we should just use ConnectionStatus directly for state instead of having to do mapping

const statusMap = {
	[ConnectionStatus.CONNECTING]: "connecting",
	[ConnectionStatus.CONNECTED]: "connected",
	[ConnectionStatus.DISCONNECTED]: "disconnected",
	[ConnectionStatus.RECONNECT_WAIT]: "reconnect-wait",
} satisfies Record<
	ConnectionStatus,
	typeof Station.infer.slippi.slippiState.status
>;

export const createSlippiConnectionSet = (stationNumber: number) => {
	const logger = prefixLogger("SlippiController", `Station ${stationNumber}`);
	const conn = new ConsoleConnection({ autoReconnect: false });
	const stream = new SlpStream();
	const parser = new SlpParser();
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let reconnectEnabled = false;
	let connectArguments: {
		ip: string;
		port: number;
		isRealtime: boolean;
		timeout: number;
	} | null = null;

	const clearReconnectTimer = () => {
		if (reconnectTimer === null) {
			return;
		}

		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	};

	const scheduleReconnect = () => {
		if (!reconnectEnabled || connectArguments === null) {
			return;
		}

		if (reconnectTimer !== null) {
			return;
		}

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState = { status: "reconnect-wait" };
		});

		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;

			if (!reconnectEnabled || connectArguments === null) {
				return;
			}

			const connectArguments_ = connectArguments;

			conn
				.connect(
					connectArguments_.ip,
					connectArguments_.port,
					connectArguments_.isRealtime,
					connectArguments_.timeout,
				)
				.catch((error: unknown) => {
					logger.error(
						`[${connectArguments_.ip}:${connectArguments_.port}] Reconnect attempt failed:`,
						error,
					);
					scheduleReconnect();
				});
		}, 2000);
	};

	const startConnection = async (
		ip: string,
		port: number,
		isRealtime = false,
		timeout = 5000,
	) => {
		reconnectEnabled = true;
		connectArguments = { ip, port, isRealtime, timeout };
		clearReconnectTimer();

		await conn.connect(ip, port, isRealtime, timeout);
	};

	const stopConnection = () => {
		reconnectEnabled = false;
		clearReconnectTimer();
		connectArguments = null;
		conn.disconnect();
	};

	conn.on(ConnectionEvent.STATUS_CHANGE, (newSlippiStatus) => {
		const newStationSlippiStatus = statusMap[newSlippiStatus];

		if (newSlippiStatus === ConnectionStatus.DISCONNECTED) {
			scheduleReconnect();
		}

		// TODO the status switches to "reconnect-wait" for a fraction of a second very often,
		// at least outside a match.
		// we should ignore such status changes unless they persist for more than 2 seconds.
		// this will prevent the UI from showing "reconnect-wait" status and then quickly switching to "connected" status repeatedly, which always sends a full state update to the frontends.

		logger.info(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] New connection status: ${newStationSlippiStatus}`,
		);

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState =
				newStationSlippiStatus === "connected"
					? {
							status: "connected",
							consoleNick: conn.getDetails().consoleNick,
							version: conn.getDetails().version,
						}
					: { status: newStationSlippiStatus };
		});
	});

	conn.on(ConnectionEvent.ERROR, (error) => {
		logger.error(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] Connection error:`,
			error,
		);

		if (reconnectEnabled) {
			scheduleReconnect();
			return;
		}

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState = {
				status: "error",
				errorMessage: "Connection error: " + String(error),
			};
		});
	});

	conn.on(ConnectionEvent.DATA, (data) => stream.process(data));

	stream.on(SlpStreamEvent.COMMAND, ({ command, payload }) =>
		parser.handleCommand(command, payload),
	);

	startReplayWriter(stream, stationNumber).catch((error: unknown) => {
		logger.error(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] ReplayWriter error:`,
			error,
		);
	});

	return {
		conn,
		stream,
		parser,
		startConnection,
		stopConnection,
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
