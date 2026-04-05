import { TRPCError } from "@trpc/server";
import { type } from "arktype";
import { Ports } from "../state";
import { stationProcedure } from "../station-procedure";
import { publicProcedure, router } from "../trpc-server";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

export const selfServiceRouter = router({
	updatePorts: stationProcedure
		.input(type({ ports: Ports }))
		.mutation(({ input, ctx }) => {
			ctx.station.ports = input.ports;
		}),
	markSetInProgress: publicProcedure
		.input(type({ setId: "number" }))
		.mutation(({ input }) =>
			fetchStartGG(
				`mutation ($setId: ID!) { markSetInProgress(setId: ${input.setId}) { id } }`,
			),
		),
	resetSet: stationProcedure.mutation(async ({ ctx }) => {
		if (ctx.station.currentSet === null) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Station doesn't have a currentSet to reset",
			});
		}

		await fetchStartGG(
			`mutation ($setId: ID!) { resetSet(setId: ${ctx.station.currentSet.startggSetId}) { id } }`,
		);

		ctx.station.ports = [null, null, null, null];
	}),
});
