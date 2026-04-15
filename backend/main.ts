import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { appRouter } from "./router";
import "./startgg-import/automeleec-updater";
import { prefixLogger } from "./logger";

/**
 * we're checking for temp replay files here and crashing early
 * so that errors are avoided later with the replay exporter when it might be a lot more annoying to deal with or maybe even when data is already lost because a replay file is discarded or there's some other conflict.
 */

const temporaryReplayFileGlob = new Bun.Glob("Station_*_temp.slp");

for await (const file of temporaryReplayFileGlob.scan({
	cwd: "./replays",
})) {
	throw new Error(
		`[Main] Error: Found temporary replay file that should not exist: ${file}. Please investigate and remove these files. Aborting server startup.`,
	);
}

const PORT =
	Bun.env.PORT === undefined ? 3000 : Number.parseInt(Bun.env.PORT, 10);

const isDevelopment = Bun.env.NODE_ENV !== "production";

const trpcHandler = createHTTPHandler({
	router: appRouter,
	basePath: "/trpc/",
});

const vite: ViteDevServer = await createViteServer({
	server: {
		middlewareMode: true,
		hmr: isDevelopment,
	},
	mode: isDevelopment ? "development" : "production",
});

const server = createServer((request, response) => {
	if (request.url !== undefined && request.url.startsWith("/trpc/")) {
		return trpcHandler(request, response);
	}

	return vite.middlewares(request, response);
});

server.listen(PORT, () => {
	prefixLogger("Main").info(
		`Server is starting on http://localhost:${PORT} ...`,
	);
});
