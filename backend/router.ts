import { on } from "node:events";
import { dashboardRouter } from "./dashboard-import/dashboard-router.js";
import { selfServiceRouter } from "./selfservice-import/selfservice-import.js";
import { emitter, globalState, type State } from "./state.js";
import { publicProcedure, router } from "./trpc-server.js";

export const appRouter = router({
	selfService: selfServiceRouter,
	dashboard: dashboardRouter,
	stateSubscription: publicProcedure.subscription(async function* ({ signal }) {
		// for first load
		yield globalState;

		for await (const [data] of on(emitter, "data", { signal }) as AsyncIterable<
			(typeof State.infer)[]
		>) {
			if (data !== undefined) {
				yield data;
			}
		}
	}),
});

export type AppRouter = typeof appRouter;
