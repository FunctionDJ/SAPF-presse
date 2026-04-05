import {
	SlpFileWriter,
	SlpFileWriterEvent,
	SlpStreamEvent,
	type SlpStream,
} from "@slippi/slippi-js/node";

// TODO if set is finished, rename the SLP files according to the schema

/**
 * how replays need to be saved:
 * (note the endash instead of hyphen)
 * ./replays/{HHMM} {Round} – {Entrant1} vs {Entrant2} – Sapf 2/Match_{n}.slp
 * {Entrant1} means (if doubles): {Player1OfEntrant1} & {Player2OfEntrant1}
 * {Entrant1} means (if singles): {Player1OfEntrant1} ({Player1OfEntrant1Character})
 * {n} is the match number in the set, starting from 1. So if there are 3 matches in the set, the files would be Match_1.slp, Match_2.slp, and Match_3.slp
 *
 * {Round} means if pools, it's "Pool {PoolNumber}" (PoolNumber is internally the phaseGroupIdentifier), if not pools it's the round number (e.g. "WR2")
 *
 * example for singles pools: 123 – Foo (Mario) vs Bar (Luigi) – Pool 2 – Sapf2
 * example for doubles pools: 123 – Foo & Baz vs Bar & Qux – Pool 2 – Sapf2
 * example for singles non-pools: 123 – Foo (Mario) vs Bar (Luigi) – WR2 – Sapf2
 * example for doubles non-pools: 123 – Foo & Baz vs Bar & Qux – WR2 – Sapf2
 */

export const startReplayWriter = async (
	stream: SlpStream,
	stationNumber: number,
) => {
	const logPrefix = `[ReplayWriter] [Station ${stationNumber}]`;
	console.log(`${logPrefix} Initializing...`);

	const tempFile = `./replays/Station_${stationNumber}_temp.slp`;

	if (await Bun.file(tempFile).exists()) {
		throw new Error(
			`${logPrefix} Temporary replay file already exist (wasn't cleaned up). Aborting Replay Writer and throwing error.`,
		);
	}

	const fileWriter = new SlpFileWriter({
		outputFiles: true,
		folderPath: "./replays",
		consoleNickname: `Station ${stationNumber}`,
	});

	stream.on(SlpStreamEvent.RAW, ({ payload }) => {
		fileWriter.write(Buffer.from(payload));
	});

	fileWriter.on(SlpFileWriterEvent.NEW_FILE, (filePath) => {
		console.log(`${logPrefix} Started recording replay: ${filePath}`);
	});

	fileWriter.on(SlpFileWriterEvent.FILE_COMPLETE, (filePath) => {
		console.log(`${logPrefix} Replay saved: ${filePath}`);
	});
};
