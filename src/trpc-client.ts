import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "../backend/router.js";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export const trpc = createTRPCClient<AppRouter>({
	links: [loggerLink(), httpBatchLink({ url: "/trpc" })],
});
