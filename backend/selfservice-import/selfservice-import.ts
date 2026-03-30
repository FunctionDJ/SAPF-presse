import { TRPCError } from "@trpc/server";
import { type } from "arktype";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";
import { stationProcedure } from "../dashboard-import/dashboard-import";
import { Ports, signalUpdate } from "../state";
import { publicProcedure, router } from "../trpc-server";

export const selfServiceRouter = router({
	updatePorts: stationProcedure
		.input(type({ ports: Ports }))
		.mutation(({ input, ctx }) => {
			console.log(
				`Updating ports for station ${ctx.station.startggStationNumber} to`,
				input.ports,
			);

			ctx.station.ports = input.ports;

			signalUpdate();
		}),
	markSetInProgress: publicProcedure
		.input(type({ setId: "number" }))
		.mutation(({ input }) =>
			fetchStartGG({
				query: `mutation ($setId: ID!) { markSetInProgress(setId: ${input.setId}) { id } }`,
			}),
		),
	resetSet: stationProcedure.mutation(async ({ ctx }) => {
		if (ctx.station.currentSet === null) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Station doesn't have a currentSet to reset",
			});
		}

		await fetchStartGG({
			query: `mutation ($setId: ID!) { resetSet(setId: ${ctx.station.currentSet.startggSetId}) { id } }`,
		});

		ctx.station.ports = [null, null, null, null];
		signalUpdate();
	}),
});
