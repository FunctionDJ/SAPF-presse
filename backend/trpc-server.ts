import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const { router } = t;
export const publicProcedure = t.procedure;
