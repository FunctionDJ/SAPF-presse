import pkg from "@slippi/slippi-js/node";

const {
	ConnectionEvent,
	ConsoleConnection,
	SlpStream,
	SlpStreamEvent,
	SlpParser,
	SlpParserEvent,
	SlpFileWriter,
	SlpFileWriterEvent,
} = pkg;

export type GameEndHandler = (params: {
	gameEnd: pkg.GameEndType;
	settings: pkg.GameStartType;
	stationId: number;
}) => unknown;

export const createSlippiConnection = async ({
	ip,
	port,
	onGameEnd,
	stationId,
	replayFolder,
}: {
	ip: string;
	port?: number;
	onGameEnd: GameEndHandler;
	stationId: number;
	replayFolder?: string;
}) => {
	const conn = new ConsoleConnection({ autoReconnect: true });
	const stream = new SlpStream();
	const parser = new SlpParser();

	const shouldWriteReplays = replayFolder !== undefined && replayFolder !== "";
	const fileWriter = shouldWriteReplays
		? new SlpFileWriter({
				outputFiles: true,
				folderPath: replayFolder,
				consoleNickname: `Station ${stationId}`,
			})
		: null;

	// TODO if set is finished, rename the SLP files according to replay-manager and ZIP them up

	stream.on(SlpStreamEvent.COMMAND, ({ command, payload }) => {
		parser.handleCommand(command, payload);
	});

	if (fileWriter) {
		stream.on(SlpStreamEvent.RAW, ({ payload }) => {
			fileWriter.write(Buffer.from(payload));
		});

		fileWriter.on(SlpFileWriterEvent.NEW_FILE, (filePath) => {
			console.log(`Started recording replay: ${filePath}`);
		});

		fileWriter.on(SlpFileWriterEvent.FILE_COMPLETE, (filePath) => {
			console.log(`Replay saved: ${filePath}`);
		});
	}

	let settingsStore: pkg.GameStartType | null = null;

	parser.on(SlpParserEvent.SETTINGS, (settings) => {
		settingsStore = settings;

		console.log(
			"Settings:",
			settings.players.map((p) => ({
				port: p.port,
				characterId: p.characterId,
				displayName: p.displayName,
				connectCode: p.connectCode,
			})),
		);
	});

	parser.on(SlpParserEvent.END, (gameEnd) => {
		console.log("Game end data:", gameEnd);

		if (settingsStore === null) {
			console.error(`No settings stored for station ${stationId}`);
			return;
		}

		onGameEnd({ gameEnd, settings: settingsStore, stationId });
		// this is necessary for SlpParserEvent.SETTINGS to be emitted again
		parser.reset();
	});

	conn.on(ConnectionEvent.DATA, stream.process.bind(stream));

	console.log(`Connecting to console ${ip}...`);

	await conn.connect(ip, port ?? 51441, false, 1000);

	conn.on(ConnectionEvent.ERROR, (err) => {
		throw err;
	});
};
