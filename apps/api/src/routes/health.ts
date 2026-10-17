import type { FastifyInstance } from "fastify"

/** GET /health — liveness probe immune to DB/network issues (skeleton phase). */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        summary: "Health check",
        description: "Liveness probe for the API.",
        response: {
          200: {
            type: "object",
            required: ["status", "service", "uptimeSeconds", "timestamp"],
            properties: {
              status: { type: "string", const: "ok" },
              service: { type: "string" },
              uptimeSeconds: { type: "number" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: "ok",
        service: "jmmcdev-api",
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      }
    },
  )
}
