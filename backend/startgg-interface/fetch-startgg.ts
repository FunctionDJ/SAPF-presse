/// <reference types="node" />
import { type, type Type } from "arktype";

export async function fetchStartGG<T>(params: {
	query: string;
	schema: Type<T>;
	variables?: Record<string, unknown>;
}): Promise<T>;

export async function fetchStartGG(params: {
	query: string;
	schema?: never;
	variables?: Record<string, unknown>;
}): Promise<unknown>;

export async function fetchStartGG(params: {
	query: string;
	schema?: Type;
	variables?: Record<string, unknown>;
}) {
	const { query, schema, variables = {} } = params;

	const response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.STARTGG_API_KEY}`,
		},
		body: JSON.stringify({ query, variables }),
	});

	const json: unknown = await response.json();

	const result = type({
		data: "unknown",
	})
		.or({
			success: "false",
			message: "string",
		})
		.assert(json);

	if ("success" in result) {
		throw new Error(`GraphQL error: ${result.message}`);
	}

	if (schema === undefined) {
		return result.data;
	}

	return schema.assert(result.data);
}
