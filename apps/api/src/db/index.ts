import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema.js"

export type TranslatableDatabase = typeof schema

/** Postgres.js client + Drizzle instance bound to the schema v1. */
export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl)
  const db = drizzle(client, { schema })
  return { db, client }
}
