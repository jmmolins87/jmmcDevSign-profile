import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(({ page }) => { expect(browserErrors.get(page)).toEqual([]); });

async function assertConnectedCanvas(page: Page) {
  const measurements = await page.locator(".workflow-canvas-stage").evaluate((stage) => {
    const nodes = Array.from(stage.querySelectorAll<HTMLElement>("[data-node-id]"));
    const boxes = nodes.map((node) => node.getBoundingClientRect().toJSON());
    const collisions = boxes.flatMap((box, index) => boxes.slice(index + 1).filter((other) => box.left < other.right && other.left < box.right && box.top < other.bottom && other.top < box.bottom));
    const distances = Array.from(stage.querySelectorAll<SVGPathElement>("[data-edge-id]")).map((path) => {
      const source = nodes.find((node) => node.dataset.nodeId === path.dataset.sourceNode);
      const target = nodes.find((node) => node.dataset.nodeId === path.dataset.targetNode);
      if (!source || !target) throw new Error("An edge is missing its source or target.");
      const matrix = path.getScreenCTM();
      if (!matrix) throw new Error("The SVG path has no screen transform.");
      const start = path.getPointAtLength(0).matrixTransform(matrix);
      const end = path.getPointAtLength(path.getTotalLength()).matrixTransform(matrix);
      const sourceBox = source.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();
      return Math.max(Math.abs(start.x - sourceBox.right), Math.abs(start.y - (sourceBox.top + sourceBox.height / 2)), Math.abs(end.x - targetBox.left), Math.abs(end.y - (targetBox.top + targetBox.height / 2)));
    });
    return { collisions: collisions.length, nodes: nodes.length, distances };
  });
  expect(measurements.nodes).toBe(5);
  expect(measurements.collisions).toBe(0);
  expect(measurements.distances).toHaveLength(4);
  expect(Math.max(...measurements.distances)).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

for (const locale of ["es", "en"] as const) {
  const text = locale === "es"
    ? { title: "EN VIVO // INGESTIÓN TELEMÉTRICA", start: "Iniciar demo", pause: "Pausar demo", resume: "Reanudar demo", reset: "Reiniciar demo", zoom: "Aumentar zoom", critical: /03\. ENRUTAMIENTO CRÍTICO/, error: /Error de inferencia mock/ }
    : { title: "LIVE // TELEMETRY INGESTION", start: "Start demo", pause: "Pause demo", resume: "Resume demo", reset: "Reset demo", zoom: "Zoom in", critical: /03\. CRITICAL ROUTING/, error: /Mock inference failed/ };

  test(`${locale}: workflow nodes remain separated and edges connected through alignment, zoom and restoration`, async ({ page }) => {
    await page.goto(`/${locale}/demos/leads-workflow`);
    await expect(page.getByRole("heading", { name: text.title })).toBeVisible();
    await assertConnectedCanvas(page);
    await page.getByRole("button", { name: "[ AUTO-ALIGN ]", exact: true }).click();
    await assertConnectedCanvas(page);
    await page.getByRole("button", { name: text.zoom, exact: true }).click();
    await assertConnectedCanvas(page);
    await page.getByRole("button", { name: "[ RESET GRID ]", exact: true }).click();
    await page.reload();
    await expect(page.getByRole("heading", { name: text.title })).toBeVisible();
    await assertConnectedCanvas(page);
  });

  test(`${locale}: workflow playback preserves ordered events during pause, resume and reset`, async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-15T09:00:00Z") });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/demos/leads-workflow`);
    await expect(page.getByRole("heading", { name: text.title })).toBeVisible();
    await page.clock.pauseAt(new Date("2026-11-15T09:01:00Z"));
    await page.getByRole("button", { name: text.start, exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: text.pause, exact: true })).toBeVisible();
    await page.clock.runFor(700);
    await expect(page.getByRole("progressbar")).toHaveAttribute("value", "20");
    await expect(page.locator('[data-node-id="node-webhook"]')).toHaveAttribute("data-node-status", "active");
    await page.getByRole("button", { name: text.pause, exact: true }).click();
    await page.clock.runFor(5000);
    await expect(page.getByRole("progressbar")).toHaveAttribute("value", "20");
    await page.getByRole("button", { name: text.resume, exact: true }).click();
    await page.clock.runFor(2800);
    await expect(page.getByRole("progressbar")).toHaveAttribute("value", "100");
    const nodeOrder = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem("jmmcdevsign:leads-workflow:v1") ?? "{}");
      return saved.events.filter((event: { id: string }) => event.id.startsWith("event-playback")).map((event: { nodeId: string }) => event.nodeId);
    });
    expect(nodeOrder).toEqual(["node-webhook", "node-ai-agent", "node-crm", "node-email", "node-slack"]);
    expect(await page.locator(".workflow-edge").evaluateAll((edges) => edges.every((edge) => getComputedStyle(edge).animationName === "none"))).toBe(true);
    await page.getByRole("button", { name: text.reset, exact: true }).click();
    await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  });

  test(`${locale}: workflow inference error stops the trace and remains recoverable`, async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-15T09:00:00Z") });
    await page.goto(`/${locale}/demos/leads-workflow`);
    await expect(page.getByRole("heading", { name: text.title })).toBeVisible();
    await page.clock.pauseAt(new Date("2026-11-15T09:01:00Z"));
    await page.getByRole("button", { name: text.critical }).click();
    await page.getByRole("button", { name: text.start, exact: true }).click();
    await page.clock.runFor(5000);
    await expect(page.getByRole("alert")).toContainText(text.error);
    await expect(page.getByRole("progressbar")).toHaveAttribute("value", "20");
    await expect(page.locator('[data-node-id="node-ai-agent"]')).toHaveAttribute("data-node-status", "error");
    await page.getByRole("button", { name: text.reset, exact: true }).click();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("button", { name: text.start, exact: true })).toBeEnabled();
  });
}
