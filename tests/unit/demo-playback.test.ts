import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoPlayback } from "@/app/lib/demo-playback";

const steps = [
  { id: "ingest", label: "Ingest", durationMs: 1000 },
  { id: "complete", label: "Complete", durationMs: 1000 },
];

describe("deterministic demo playback", () => {
  afterEach(() => vi.useRealTimers());

  it("pauses the remaining duration and resumes each business step exactly once", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const playback = createDemoPlayback({ steps, onStep: (id) => { events.push(id); }, onReset: () => { events.length = 0; } });
    await playback.start();
    await vi.advanceTimersByTimeAsync(600);
    await playback.pause();
    await playback.pause();
    await vi.advanceTimersByTimeAsync(4000);
    expect(events).toEqual([]);
    await playback.resume();
    await playback.resume();
    await vi.advanceTimersByTimeAsync(399);
    expect(events).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(events).toEqual(["ingest"]);
    expect(await playback.getState()).toMatchObject({ currentStep: 1, progress: 50 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(events).toEqual(["ingest", "complete"]);
    expect(await playback.getState()).toEqual({ status: "completed", currentStep: 1, progress: 100 });
  });

  it("restores fixtures on reset and cancels the next automatic action", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const playback = createDemoPlayback({ steps, onStep: (id) => { events.push(id); }, onReset: () => { events.length = 0; } });
    await playback.start();
    await vi.advanceTimersByTimeAsync(1000);
    await playback.reset();
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toEqual([]);
    expect(await playback.getState()).toEqual({ status: "idle", currentStep: 0, progress: 0 });
  });

  it.each(["reset", "stop"] as const)("does not start after %s invalidates pending fixture restoration", async (action) => {
    vi.useFakeTimers();
    let release!: () => void;
    const events: string[] = [];
    const restoration = new Promise<void>((resolve) => { release = resolve; });
    const playback = createDemoPlayback({ steps, onStep: (id) => { events.push(id); }, onReset: () => restoration });
    const starting = playback.start();
    const invalidating = playback[action]();
    release();
    await starting;
    await invalidating;
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toEqual([]);
    expect((await playback.getState()).status).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops at an error, exposes the cause and refuses resume until reset", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const playback = createDemoPlayback({ steps, onStep: (id) => { events.push(id); throw new Error("Webhook rejected"); }, onReset: () => undefined });
    await playback.start();
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toEqual(["ingest"]);
    expect(playback.getError()).toBe("Webhook rejected");
    expect((await playback.resume()).status).toBe("paused");
    await playback.reset();
    expect(playback.getError()).toBeNull();
  });

  it("waits for an in-flight mutation before restoring fixtures", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    let value = "fixture";
    const playback = createDemoPlayback({ steps, onStep: async () => { await new Promise<void>((resolve) => { release = resolve; }); value = "mutated"; }, onReset: () => { value = "fixture"; } });
    await playback.start();
    await vi.advanceTimersByTimeAsync(1000);
    const resetting = playback.reset();
    release();
    await resetting;
    expect(value).toBe("fixture");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("applies a single step when advance is pressed again while the step is still running", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    let enter!: () => void;
    let release!: () => void;
    const entered = new Promise<void>((resolve) => { enter = resolve; });
    const response = new Promise<void>((resolve) => { release = resolve; });
    const playback = createDemoPlayback({
      steps,
      onStep: async (id) => { events.push(id); enter(); await response; },
      onReset: () => { events.length = 0; },
    });
    const first = playback.advance();
    await entered;
    const duplicate = playback.advance();
    release();
    await Promise.all([first, duplicate]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toEqual(["ingest"]);
    expect(await playback.getState()).toEqual({ status: "paused", currentStep: 1, progress: 50 });
  });

  it("changes translated labels without restarting the active step", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const options = { steps, onStep: (id: string) => { events.push(id); }, onReset: () => undefined };
    const playback = createDemoPlayback(options);
    await playback.start();
    await vi.advanceTimersByTimeAsync(600);
    playback.updateOptions({ ...options, steps: steps.map((step) => ({ ...step, label: `Translated ${step.id}` })) });
    await vi.advanceTimersByTimeAsync(400);
    expect(events).toEqual(["ingest"]);
    expect((await playback.getState()).progress).toBe(50);
  });

  it("requires reset when the business plan changes during playback", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const options = { steps, onStep: (id: string) => { events.push(id); }, onReset: () => undefined };
    const playback = createDemoPlayback(options);
    await playback.start();
    playback.updateOptions({ ...options, steps: [{ id: "replacement", label: "Replacement", durationMs: 500 }] });
    await vi.advanceTimersByTimeAsync(5000);
    expect(events).toEqual([]);
    expect(playback.getError()).toContain("Reset before continuing");
    await playback.reset();
    await playback.start();
    await vi.advanceTimersByTimeAsync(500);
    expect(events).toEqual(["replacement"]);
  });
});
