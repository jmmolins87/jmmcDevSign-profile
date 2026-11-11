import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("design token foundation", () => {
  it("exposes primitive and semantic token layers in the global stylesheet", () => {
    const stylesheet = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

    expect(stylesheet).toContain("--primitive-color-obsidian");
    expect(stylesheet).toContain("--primitive-space-xs");
    expect(stylesheet).toContain("--color-background: var(--sys-color-background)");
    expect(stylesheet).toContain("--color-primary: var(--sys-color-primary)");
    expect(stylesheet).toContain("--font-headline:");
    expect(stylesheet).toContain("--font-mono:");
  });
});
