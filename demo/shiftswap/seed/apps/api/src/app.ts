import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";

// Skeleton only. No ShiftSwap endpoint is built yet.
export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options);

  app.get("/api/healthz", () => ({ status: "ok" }));

  return app;
}
