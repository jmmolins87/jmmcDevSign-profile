import { describe, expect, it } from "vitest"

import { createDb } from "../src/db/index.js"

/**
 * postgres.js connects lazily: creating a client against a bogus DSN opens
 * no sockets and satisfies "no unit test requires a running database".
 */
describe("createDb", () => {
  it("returns a drizzle db and its underlying client without connecting", async () => {
    const { db, client } = createDb("postgres://nonexistent:54321/nodb")
    expect(db).toBeDefined()
    expect(typeof db.select).toBe("function")
    expect(typeof client.end).toBe("function")
    await client.end({ timeout: 1 })
  })
})
