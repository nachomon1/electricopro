import { authRouter } from "./auth-router";
import { directoryRouter, leadsRouter, proRouter } from "./directory-router";
import { flowRouter } from "./flow-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  directory: directoryRouter,
  pro: proRouter,
  leads: leadsRouter,
  flow: flowRouter,
});

export type AppRouter = typeof appRouter;
