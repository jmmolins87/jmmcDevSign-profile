import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/components/**/*.test.tsx"],
    restoreMocks: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
