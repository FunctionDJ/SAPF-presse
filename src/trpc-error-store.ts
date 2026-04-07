import { type } from "arktype";

export const listenerContainer = {
	listener: () => {
		/** no-op */
	},
};

export let tRPCErrorRecord: {
	summary: string;
	path: string | null;
} | null = null;

export const reportTrpcError = (error: Error, keyLike: unknown) => {
	const summary = error.message || "Unknown tRPC error";

	if (keyLike === undefined) {
		tRPCErrorRecord = {
			summary,
			path: null,
		};
	} else {
		const parsedKeyResult = type("string[][]")(keyLike);

		tRPCErrorRecord = {
			summary,
			path:
				parsedKeyResult instanceof type.errors
					? "(unsupported key path format)"
					: parsedKeyResult.join("."),
		};
	}

	listenerContainer.listener();
};

export const clearTrpcErrors = () => {
	tRPCErrorRecord = null;
	listenerContainer.listener();
};
