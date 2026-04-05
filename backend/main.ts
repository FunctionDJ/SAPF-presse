import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { appRouter } from "./router";
import "./startgg-import/sapfpresse-updater";

const PORT =
	Bun.env.PORT !== undefined ? Number.parseInt(Bun.env.PORT, 10) : 3000;

const isDev = Bun.env.NODE_ENV !== "production";

const trpcHandler = createHTTPHandler({
	router: appRouter,
	basePath: "/trpc/",
});

const vite: ViteDevServer = await createViteServer({
	server: {
		middlewareMode: true,
		hmr: isDev,
	},
	mode: isDev ? "development" : "production",
});

const server = createServer((req, res) => {
	if (req.url !== undefined && req.url.startsWith("/trpc/")) {
		return trpcHandler(req, res);
	}

	return vite.middlewares(req, res);
});

server.listen(PORT, () => {
	console.log(`[Main] Server listening on http://localhost:${PORT}`);
});
