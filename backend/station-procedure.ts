import { type } from "arktype";
import { updateStateAsync } from "./state";
import { publicProcedure } from "./trpc-server";
import { TRPCError } from "@trpc/server";

export const stationProcedure = publicProcedure
	.input(type({ stationNumber: "number" }))
	.use(async ({ next, input, ctx }) =>
		updateStateAsync((state) => {
			const station = state.stations.find(
				(s) => s.startggStationNumber === input.stationNumber,
			);

			if (station === undefined) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Station with number ${input.stationNumber} not found`,
				});
			}

			return next({
				ctx: {
					...ctx,
					station,
				},
			});
		}),
	);
