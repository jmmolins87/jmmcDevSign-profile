export type PlaybackStatus = "idle" | "running" | "paused" | "completed";
export type PlaybackStep = { id: string; label: string; durationMs: number };
export type PlaybackState = { status: PlaybackStatus; currentStep: number; progress: number };

export interface DemoPlaybackController {
  start(): Promise<PlaybackState>;
  advance(): Promise<PlaybackState>;
  pause(): Promise<PlaybackState>;
  resume(): Promise<PlaybackState>;
  reset(): Promise<PlaybackState>;
  getState(): Promise<PlaybackState>;
}

export type PlaybackOptions = {
  steps: readonly PlaybackStep[];
  onStep: (stepId: string, index: number) => void | Promise<void>;
  onReset: () => void | Promise<void>;
};

type PlaybackClock = {
  now(): number;
  setTimeout(callback: () => void, durationMs: number): ReturnType<typeof setTimeout>;
  clearTimeout(timer: ReturnType<typeof setTimeout>): void;
};

const browserClock: PlaybackClock = {
  now: () => Date.now(),
  setTimeout: (callback, durationMs) => setTimeout(callback, durationMs),
  clearTimeout: (timer) => clearTimeout(timer),
};

/** A local clock drives presentation only; business data belongs to each adapter. */
export function createDemoPlayback(initialOptions: PlaybackOptions, clock: PlaybackClock = browserClock) {
  let options = initialOptions;
  if (!options.steps.length || options.steps.some((step) => !Number.isFinite(step.durationMs) || step.durationMs <= 0)
      || new Set(options.steps.map((step) => step.id)).size !== options.steps.length) {
    throw new Error("Playback requires unique steps with positive durations.");
  }
  let state: PlaybackState = { status: "idle", currentStep: 0, progress: 0 };
  let error: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let remainingMs = options.steps[0].durationMs;
  let scheduledAt = 0;
  let generation = 0;
  let inFlight: Promise<void> | null = null;
  let resetPending: Promise<PlaybackState> | null = null;
  let startPending: Promise<PlaybackState> | null = null;
  let advancePending: Promise<PlaybackState> | null = null;
  const listeners = new Set<() => void>();

  function publish(next: PlaybackState) {
    state = next;
    for (const listener of listeners) listener();
  }

  function clearTimer() {
    if (timer !== undefined) clock.clearTimeout(timer);
    timer = undefined;
  }

  function schedule() {
    if (state.status !== "running" || timer !== undefined || inFlight) return;
    scheduledAt = clock.now();
    timer = clock.setTimeout(() => {
      timer = undefined;
      void executeStep();
    }, remainingMs);
  }

  function executeStep() {
    const currentGeneration = generation;
    const index = state.currentStep;
    const step = options.steps[index];
    inFlight = (async () => {
      try {
        await options.onStep(step.id, index);
        if (generation !== currentGeneration) return;
        const completedSteps = index + 1;
        const completed = completedSteps === options.steps.length;
        remainingMs = options.steps[completed ? index : completedSteps].durationMs;
        publish({
          status: completed ? "completed" : state.status,
          currentStep: completed ? index : completedSteps,
          progress: Math.round(completedSteps / options.steps.length * 100),
        });
      } catch (cause) {
        if (generation !== currentGeneration) return;
        error = cause instanceof Error ? cause.message : "Playback step failed.";
        publish({ ...state, status: "paused" });
      }
    })().finally(() => {
      inFlight = null;
      if (generation === currentGeneration) schedule();
    });
    return inFlight;
  }

  const controller = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => state,
    getError: () => error,
    updateOptions(next: PlaybackOptions) {
      const changedPlan = next.steps.length !== options.steps.length || next.steps.some((step, index) => step.id !== options.steps[index]?.id);
      options = next;
      if (changedPlan && state.status !== "idle") {
        generation += 1;
        clearTimer();
        error = "Playback steps changed. Reset before continuing.";
        publish({ ...state, status: "paused" });
      }
    },
    async getState() { return state; },
    async start(): Promise<PlaybackState> {
      if (startPending) return startPending;
      if (advancePending) return advancePending;
      if (state.status === "running") return state;
      if (state.status === "paused" && !error) return controller.resume();
      startPending = (async () => {
        const restoration = controller.reset();
        const startGeneration = generation;
        await restoration;
        if (error || generation !== startGeneration) return state;
        publish({ status: "running", currentStep: 0, progress: 0 });
        schedule();
        return state;
      })().finally(() => { startPending = null; });
      return startPending;
    },
    async advance(): Promise<PlaybackState> {
      if (advancePending) return advancePending;
      if (startPending || inFlight || error || state.status === "running" || state.status === "completed") return state;
      advancePending = (async () => {
        if (state.status === "idle") {
          const restoration = controller.reset();
          const startGeneration = generation;
          await restoration;
          if (error || generation !== startGeneration) return state;
          publish({ ...state, status: "paused" });
        }
        await executeStep();
        return state;
      })().finally(() => { advancePending = null; });
      return advancePending;
    },
    async pause(): Promise<PlaybackState> {
      if (state.status !== "running") return state;
      if (timer !== undefined) remainingMs = Math.max(0, remainingMs - (clock.now() - scheduledAt));
      clearTimer();
      publish({ ...state, status: "paused" });
      return state;
    },
    async resume(): Promise<PlaybackState> {
      if (state.status !== "paused" || error) return state;
      publish({ ...state, status: "running" });
      schedule();
      return state;
    },
    async reset(): Promise<PlaybackState> {
      generation += 1;
      if (resetPending) return resetPending;
      clearTimer();
      error = null;
      publish({ status: "idle", currentStep: 0, progress: 0 });
      resetPending = (async () => {
        // Already-started mutations settle before fixtures are restored, so reset wins.
        if (inFlight) await inFlight;
        try {
          await options.onReset();
          remainingMs = options.steps[0].durationMs;
        } catch (cause) {
          error = cause instanceof Error ? cause.message : "Playback reset failed.";
          publish({ ...state, status: "paused" });
        }
        return state;
      })().finally(() => { resetPending = null; });
      return resetPending;
    },
    stop() {
      generation += 1;
      clearTimer();
      if (state.status === "running") publish({ ...state, status: "paused" });
    },
  } satisfies DemoPlaybackController & Record<string, unknown>;
  return controller;
}
