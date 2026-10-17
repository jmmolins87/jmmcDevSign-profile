import { buildServer } from "./app.js"

/** Bootstrap entry point: bind and listen. Not exercised by unit tests. */
export async function start(): Promise<void> {
  const app = await buildServer()
  await app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" })
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  await start()
}
