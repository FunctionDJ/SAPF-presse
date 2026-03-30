import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { appRouter } from "./router";
import { createSlippiConnection } from "./slippi-import/slippi-import";
import "./startgg-import/sapfpresse-updater";

const PORT =
	process.env.PORT !== undefined ? Number.parseInt(process.env.PORT, 10) : 3000;

const isDev = process.env.NODE_ENV !== "production";

const trpcHandler = createHTTPHandler({
	router: appRouter,
	basePath: "/trpc/",
});

// TODO the following is so that knip doesn't see that whole tree of files as unused
// eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
if (false) {
	void createSlippiConnection({
		ip: "10.0.0.10",
		stationNumber: 1,
	});
}

const vite: ViteDevServer = await createViteServer({
	server: { middlewareMode: true, hmr: isDev },
	mode: isDev ? "development" : "production",
});

const server = createServer((req, res) => {
	if (req.url !== undefined && req.url.startsWith("/trpc/")) {
		return trpcHandler(req, res);
	}

	return vite.middlewares(req, res);
});

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
