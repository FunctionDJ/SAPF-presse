import {
	SlpFileWriter,
	SlpFileWriterEvent,
	SlpStreamEvent,
	characters,
	type SlpStream,
} from "@slippi/slippi-js/node";
import {
	getStationOrThrow,
	type CurrentSet,
	type EntrantInActiveStartGGSet,
} from "../state";
import fs from "node:fs";
import { prefixLogger } from "../logger";

// TODO are we recording replays even if mode is not startgg etc? like, the only dependency is slippi/station being connected?

/**
 * how replays need to be saved:
 * (note the endash instead of hyphen)
 * ./replays/{HHMM} {Entrant1} vs {Entrant2} – {Round} – Sapf 2/Match_{n}.slp
 * {Entrant1} means (if doubles): {Player1OfEntrant1} & {Player2OfEntrant1}
 * {Entrant1} means (if singles): {Player1OfEntrant1} ({Player1OfEntrant1Character})
 * {n} is the match number in the set, starting from 1. So if there are 3 matches in the set, the files would be Match_1.slp, Match_2.slp, and Match_3.slp
 *
 * {Round} means if pools, it's "Pool {PoolNumber}" (PoolNumber is internally the phaseGroupIdentifier), if not pools it's the round number (e.g. "WR2")
 *
 * (all sets played at 17:23)
 * example for singles pools parent folder: 1723 – Foo (Mario) vs Bar (Luigi) – Pool 2 – Sapf2
 * example for doubles pools parent folder: 1723 – Foo & Baz vs Bar & Qux – Pool 2 – Sapf2
 * example for singles non-pools parent folder: 1723 – Foo (Mario) vs Bar (Luigi) – WR2 – Sapf2
 * example for doubles non-pools parent folder: 1723 – Foo & Baz vs Bar & Qux – WR2 – Sapf2
 */

const getEntrantString = (entrant: typeof EntrantInActiveStartGGSet.infer) => {
	const characterId = entrant.player1.character?.slippiCharacterId;

	const character =
		characterId === undefined ? null : characters.getCharacterName(characterId);

	return `${entrant.player1.tag}${character === null ? "" : ` (${character})`}`;
};

const dateToHHMM = (date: Date) => {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${hours}${minutes}`;
};

const getRoundString = (currentSet: typeof CurrentSet.infer) => {
	const { phaseGroup } = currentSet;

	if (phaseGroup.bracketType === "ROUND_ROBIN") {
		return `Pool ${phaseGroup.displayIdentifier}`;
	}

	if (phaseGroup.bracketType === "DOUBLE_ELIMINATION") {
		// [STARTGG] would have been cool if startgg had a cleaner way to get round info that we can customize, like "side" (winners/losers) + round number or "grand-finals" etc. as enum-likes.
		// we do the below so "Winners Finals" becomes "WF", "Losers Round 2" becomes "LR2", etc.
		return currentSet.fullRoundText.replaceAll(/[a-z\s]/g, "");
	}

	return `[Unsupported Bracket Type ${phaseGroup.bracketType}, fullRoundText ${currentSet.fullRoundText}]`;
};

const getReplayFileFolderName = (stationNumber: number) => {
	const station = getStationOrThrow(stationNumber);
	const { currentSet } = station;

	if (currentSet === null) {
		return `(Ended at ${dateToHHMM(new Date())}) – Station ${stationNumber} – [NO SET INFO, CURRENT SET WAS NULL] – Sapf2`; // TODO same replace as below
	}

	const HHMM = dateToHHMM(currentSet.startedAt ?? new Date());
	const entrant1String = getEntrantString(currentSet.entrantA);
	const entrant2String = getEntrantString(currentSet.entrantB);
	const round = getRoundString(currentSet);

	return `${HHMM} – ${entrant1String} vs ${entrant2String} – ${round} – Sapf2`; // TODO replace Sapf2 with fetched tournament name from startgg
};

const getMatchNumber = (stationNumber: number) => {
	const { currentSet } = getStationOrThrow(stationNumber);
	const logger = prefixLogger("ReplayWriter", `Station ${stationNumber}`);

	if (currentSet === null) {
		logger.warn("getMatchNumber: currentSet is null, returning null");
		return null;
	}

	return currentSet.entrantA.score + currentSet.entrantB.score + 1;
};

const getReplayFilePath = (stationNumber: number) => {
	const replaySubfolderName = getReplayFileFolderName(stationNumber);
	const matchNumber = getMatchNumber(stationNumber);

	if (matchNumber === null) {
		return `./replays/${replaySubfolderName}/Match_unknown_${Date.now()}.slp`;
	}

	return `./replays/${replaySubfolderName}/Match_${matchNumber}.slp`;
};

export const startReplayWriter = async (
	stream: SlpStream,
	stationNumber: number,
) => {
	const logger = prefixLogger("ReplayWriter", `Station ${stationNumber}`);
	logger.info("Initializing...");

	const temporaryFile = `./replays/Station_${stationNumber}_temp.slp`;

	if (await Bun.file(temporaryFile).exists()) {
		const message =
			"Temporary replay file already exist (wasn't cleaned up). Aborting Replay Writer and throwing error.";

		logger.error(message);
		throw new Error(message);
	}

	const fileWriter = new SlpFileWriter({
		outputFiles: true,
		folderPath: "./replays",
		consoleNickname: `Station ${stationNumber}`,
	});

	stream.on(SlpStreamEvent.RAW, (data) => {
		fileWriter.write(Buffer.from(data.payload));
	});

	fileWriter.on(SlpFileWriterEvent.NEW_FILE, (filePath: string) => {
		logger.info(`Started recording replay: ${filePath}`);
	});

	fileWriter.on(SlpFileWriterEvent.FILE_COMPLETE, (filePath: string) => {
		logger.info(`Replay saved (temp path): ${filePath}`);
		logger.info("Renaming and moving replay file...");
		const replaySubfolderName = getReplayFileFolderName(stationNumber);

		try {
			fs.mkdirSync(`./replays/${replaySubfolderName}`, { recursive: true });
		} catch (error) {
			// only catch the error if it's about the folder already existing, otherwise rethrow it

			if (error instanceof Error && "code" in error) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				const typedError = error as NodeJS.ErrnoException;

				if (typedError.code === "EEXIST") {
					return;
				}
			}

			const message = `Unexpected error when trying to create replay subfolder ${replaySubfolderName}`;
			logger.error(message, error);
			throw new Error(message, { cause: error });
		}

		const targetPath = getReplayFilePath(stationNumber);

		try {
			fs.renameSync(filePath, targetPath);

			logger.info(`Replay file renamed and moved to: ${targetPath}`);
		} catch (error) {
			logger.warn(
				`Error renaming/moving replay file from ${filePath} to ${targetPath}: ${error}`,
			);

			const fallbackPath = `./replays/${replaySubfolderName}/Match_unknown_${Date.now()}.slp`;
			fs.renameSync(filePath, fallbackPath);
			logger.info(`Replay file renamed and moved to: ${fallbackPath}`);
		}
	});
};
