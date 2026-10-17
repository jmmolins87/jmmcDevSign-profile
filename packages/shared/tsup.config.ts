import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/env.ts", "src/api.ts", "src/events.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
})
