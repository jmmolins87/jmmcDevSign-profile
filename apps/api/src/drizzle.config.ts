import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    // Reads --env-file-if-exists=../../.env (loaded before drizzle-kit runs).
    url: process.env.DATABASE_URL ?? "postgresql://127.0.0.1:54322/postgres",
  },
  strict: true,
})
