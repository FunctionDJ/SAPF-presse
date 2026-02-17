import type { GameEndType, GameStartType } from "@slippi/slippi-js/node";
import fs from "node:fs/promises";
import { reportBracketSetBySlippiData } from "./report-bracket-set-by-slippi-data";
import { portsStorage } from "./router";

const dataString = await fs.readFile("./abba.json", "utf-8");

const data = JSON.parse(dataString) as {
	gameEnd: GameEndType;
	settings: GameStartType;
	stationId: number;
};

await reportBracketSetBySlippiData({
	portsStorage,
	data,
});

process.exit(0);
