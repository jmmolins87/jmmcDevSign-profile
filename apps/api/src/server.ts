import Fastify from "fastify"
import type { FastifyInstance } from "fastify"

import { healthRoutes } from "./routes/health.js"
import { loadEnv } from "./env.js"
import { registerCommonPlugins } from "./plugins.js"

/** Builds a fully configured Fastify instance (no listening). Used by tests. */
export async function buildServer(
  envSource: NodeJS.ProcessEnv = process.env,
): Promise<FastifyInstance> {
  const env = loadEnv(envSource)

  const app = Fastify({
    logger: env.NODE_ENV === "production" ? { level: "info" } : { level: "warn" },
  })

  await registerCommonPlugins(app, env)
  await app.register(healthRoutes)

  return app
}

async function start(): Promise<void> {
  const app = await buildServer()
  await app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" })
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  await start()
}
