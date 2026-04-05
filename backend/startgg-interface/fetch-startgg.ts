import { type } from "arktype";

const StartGGGraphQLResponse = type({
	data: "unknown",
}).or({
	errors: type({
		message: "string",
	}).array(),
});

export const fetchStartGG = async (
	query: string,
	variables: Record<string, unknown> = {},
) => {
	const response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${Bun.env.STARTGG_API_KEY}`,
		},
		body: JSON.stringify({ query, variables }),
	});

	const json = await response.json();
	const result = StartGGGraphQLResponse(json);

	if (result instanceof type.errors) {
		throw new Error(
			`[FetchStartGG] Invalid response: ${result.summary}\nResponse was: ${JSON.stringify(json, null, 2)}`,
		);
	}

	if ("errors" in result) {
		throw new Error(
			`[FetchStartGG] GraphQL error(s): ${result.errors.map((e) => e.message).join(", ")}`,
		);
	}

	return result.data;
};
