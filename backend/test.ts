import * as winston from "winston";
import { fetchStartGG } from "./startgg-interface/fetch-startgg";

const winstonLogger = winston.createLogger({
	transports: [new winston.transports.Console()],
});

const myError = new Error("This is an error");

async function somethingThatLogs() {
	await fetchStartGG(
		`
				mutation ReportSet($setId: ID!, $gameData: [BracketSetGameDataInput], $winnerId: Int) {
					reportBracketSet(setId: $setId, gameData: $gameData, winnerId: $winnerId) {
						id
					}
				}
			`,
	);
}

somethingThatLogs().catch((error: unknown) => {
	winstonLogger.error("Failed to report set", error); // TODO this happens on report without a processed SETTINGS event (at least)
});
