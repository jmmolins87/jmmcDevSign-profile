import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import rateLimit from "@fastify/rate-limit"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import type { FastifyInstance } from "fastify"
import type { ApiEnv } from "@jmmcdev/shared/env"

/**
 * Security and documentation plugins: helmet, CORS restricted to the web
 * origin, rate limiting, and auto-generated OpenAPI served at `/docs`.
 */
export async function registerCommonPlugins(
  app: FastifyInstance,
  env: ApiEnv,
): Promise<void> {
  await app.register(helmet)

  await app.register(cors, {
    origin: [env.WEB_URL],
    credentials: true,
  })

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
  })

  await app.register(swagger, {
    openapi: {
      info: {
        title: "JMMC API",
        description: "API for the JMMC portfolio (guidelines §7).",
        version: "0.1.0",
      },
      servers: [{ url: env.API_URL }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "none",
    },
  })
}
