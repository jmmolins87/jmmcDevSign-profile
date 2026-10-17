import Fastify from "fastify"
import type { FastifyInstance } from "fastify"

import { healthRoutes } from "./routes/health.js"
import { loadEnv } from "./env.js"
import { registerCommonPlugins } from "./plugins.js"

/**
 * Builds a fully configured Fastify instance (no listening, no external
 * connections). Used by unit tests with an injected env source.
 */
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
