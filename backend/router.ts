import { type } from "arktype";
import fs from "node:fs/promises";
import { z } from "zod";
import { reportBracketSetBySlippiData } from "./report-bracket-set-by-slippi-data.js";
import { createSlippiConnection, type GameEndHandler } from "./slippi.js";
import { publicProcedure, router } from "./trpc-server.js";

const portsFile = await fs.readFile("./ports.json", "utf-8").catch(() => "{}");
const portsSchema = type("Record<string, (number | null)[]>");

/** maps from station id to port array (should always be length 4), where null is "no player" and number is the participant id on start.gg */
export const portsStorage = portsSchema.assert(JSON.parse(portsFile));

const updatePorts = async (stationId: number, ports: (number | null)[]) => {
	portsStorage[stationId] = ports;
	await fs.writeFile("./ports.json", JSON.stringify(portsStorage));
};

const onGameEnd: GameEndHandler = async (data) => {
	try {
		await reportBracketSetBySlippiData({
			portsStorage,
			data,
		});

		// todo only at set end / win
		// await updatePorts(stationId, [null, null, null, null]);
	} catch (error) {
		console.error("Error in onGameEnd:", error);
	}
};

// await createSlippiConnection({
// 	ip: "localhost",
// 	port: 53742,
// 	stationId: 3,
// 	onGameEnd,
// 	replayFolder: "./replays",
// });
// await createSlippiConnection({
// 	ip: "10.0.2.48",
// 	stationId: 3,
// 	onGameEnd,
// 	replayFolder: "./replays",
// });

export const appRouter = router({
	getAllPorts: publicProcedure.query(() => portsStorage),
	slippiStatus: publicProcedure.query(() => {
		// TODO implement slippi status fetching
		return {
			stations: [],
		};
	}),
	updatePorts: publicProcedure
		.input(
			z.object({
				stationId: z.number(),
				ports: z.array(z.int().nullable()).length(4),
			}),
		)
		.mutation(async ({ input }) => {
			console.log(
				`Updating ports for station ${input.stationId}:`,
				input.ports,
			);

			await updatePorts(input.stationId, input.ports);
		}),
});

export type AppRouter = typeof appRouter;
