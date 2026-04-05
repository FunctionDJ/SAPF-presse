import { type } from "arktype";
import { slippiRouter } from "../slippi-import/slippi-controller-router";
import {
	Mode,
	OverrideEntrant,
	Ports,
	globalState as globalState,
	updateStateSync,
} from "../state";
import { stationProcedure } from "../station-procedure";
import { publicProcedure, router } from "../trpc-server";
import { TRPCError } from "@trpc/server";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

export const dashboardRouter = router({
	slippi: slippiRouter,
	setStartggTournamentIdViaSlug: publicProcedure
		.input(type({ startggTournamentSlug: "string" }))
		.mutation(async ({ input }) => {
			const response = await fetchStartGG(`
					query getEventId {
						tournament(slug: "${input.startggTournamentSlug}") {
							id
						}
					}`);

			const validatedData = type({
				tournament: {
					id: "number.integer",
				},
			}).assert(response);

			updateStateSync((state) => {
				state.startggTournamentId = validatedData.tournament.id;
				state.startggStreamQueueIdToTrack = null;
			});
		}),
	getStreamQueues: publicProcedure.query(async () => {
		if (globalState.startggTournamentId === null) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "startggTournamentId is not set",
			});
		}

		const response = await fetchStartGG(
			`
				query StreamQueues {
					streamQueue(tournamentId: ${globalState.startggTournamentId}, includePlayerStreams: false) {
						id
						stream {
							enabled
							isOnline
							shortName
							streamName
							streamSource
						}
					}
				}`,
		);

		const validatedData = type({
			tournament: {
				streamQueue: {
					id: "string",
					stream: {
						enabled: "boolean",
						isOnline: "boolean",
						shortName: "string",
						streamName: "string",
						streamSource: type.or(
							"'TWITCH'",
							"'HITBOX'",
							"'STREAMME'",
							"'MIXER'",
							"'YOUTUBE'",
						),
					},
				},
			},
		}).assert(response);

		return validatedData.tournament.streamQueue;
	}),
	setStartggStreamQueueIdToTrack: publicProcedure
		.input(type({ startggStreamQueueIdToTrack: "string" }))
		.mutation(({ input }) => {
			// TODO dont auto-start startgg fetch-loop but start it when this is set?
			updateStateSync((state) => {
				state.startggStreamQueueIdToTrack = input.startggStreamQueueIdToTrack;
			});
		}),
	setCenterText: publicProcedure
		.input(type({ centerText: "string" }))
		.mutation(({ input }) => {
			updateStateSync((state) => {
				state.centerText = input.centerText;
			});
		}),
	setBestOf: stationProcedure
		.input(type({ bestOf: "number" }))
		.mutation(({ input, ctx }) => {
			ctx.station.bestOf = input.bestOf;
		}),
	setPorts: stationProcedure
		.input(type({ ports: Ports }))
		.mutation(({ input, ctx }) => {
			ctx.station.ports = input.ports;
		}),
	setEntrantOverride: stationProcedure
		.input(type({ entrantOverride: [OverrideEntrant, OverrideEntrant] }))
		.mutation(({ input, ctx }) => {
			ctx.station.entrantOverride = input.entrantOverride;
		}),
	setBasicTextOverride: stationProcedure
		.input(type({ basicTextOverride: "string" }))
		.mutation(({ input, ctx }) => {
			ctx.station.basicTextOverride = input.basicTextOverride;
		}),
	setMode: stationProcedure
		.input(type({ mode: Mode }))
		.mutation(({ input, ctx }) => {
			ctx.station.mode = input.mode;
		}),
});
