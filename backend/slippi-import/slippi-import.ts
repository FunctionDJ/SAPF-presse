import pkg from "@slippi/slippi-js/node";
import { startReplayWriter } from "../replay-export/replay-export";
import { reportBracketSetBySlippiData } from "../startgg-export/report-bracket-set-by-slippi-data";
import { updateStateOnSettingsEvent } from "./update-state-on-settings-event";

const {
	ConnectionEvent,
	ConsoleConnection,
	SlpStream,
	SlpStreamEvent,
	SlpParser,
	SlpParserEvent,
} = pkg;

export const createSlippiConnection = async ({
	ip,
	slippiPort,
	stationNumber,
}: {
	ip: string;
	slippiPort?: number;
	stationNumber: number;
}) => {
	const effectivePort = slippiPort ?? 51441;
	const logPrefix = `[SlippiImport] [Station ${stationNumber} at ${ip}:${effectivePort}]`;
	console.log(`${logPrefix} Starting connection setup...`);
	const conn = new ConsoleConnection({ autoReconnect: true });
	const stream = new SlpStream();
	const parser = new SlpParser();

	startReplayWriter(stream, stationNumber);

	stream.on(SlpStreamEvent.COMMAND, ({ command, payload }) => {
		parser.handleCommand(command, payload);
	});

	parser.on(SlpParserEvent.SETTINGS, (settings) => {
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
			return;
		}

		updateStateOnSettingsEvent(logPrefix, settings, stationNumber);

		console.log(
			`${logPrefix} Settings:`,
			settings.players.map((p) => ({
				port: p.port,
				characterId: p.characterId,
				displayName: p.displayName,
				connectCode: p.connectCode,
			})),
		);
	});

	parser.on(SlpParserEvent.END, (gameEnd) => {
		console.log(`${logPrefix} Game end data:`, gameEnd);

		reportBracketSetBySlippiData({
			stationNumber,
			gameEnd,
		})
			.catch((err: unknown) => {
				console.error(`${logPrefix} Failed to report set:`, err);
			})
			.finally(() => {
				// parser.reset() is necessary for SlpParserEvent.SETTINGS to be emitted again
				parser.reset();
			});
	});

	conn.on(ConnectionEvent.DATA, stream.process.bind(stream));
	console.log(`${logPrefix} Connecting to console...`);
	await conn.connect(ip, effectivePort, false, 1000);
	console.log(`${logPrefix} Successfully connected to console`);

	conn.on(ConnectionEvent.ERROR, (err) => {
		console.error(`${logPrefix} Connection error:`, err);
		throw err;
	});
};
