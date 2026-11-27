"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createDemoPlayback, type PlaybackOptions, type PlaybackState, type PlaybackStep } from "@/app/lib/demo-playback";
export type { PlaybackState, PlaybackStep } from "@/app/lib/demo-playback";

export type DemoPlaybackHandle = {
  state: PlaybackState;
  error: string | null;
  steps: readonly PlaybackStep[];
  start: () => Promise<PlaybackState>;
  advance: () => Promise<PlaybackState>;
  pause: () => Promise<PlaybackState>;
  resume: () => Promise<PlaybackState>;
  reset: () => Promise<PlaybackState>;
};

export function useDemoPlayback(options: PlaybackOptions): DemoPlaybackHandle {
  const [controller] = useState(() => createDemoPlayback(options));
  useEffect(() => { controller.updateOptions(options); }, [controller, options]);
  useEffect(() => () => { controller.stop(); }, [controller]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { state, error: controller.getError(), steps: options.steps, start: controller.start, advance: controller.advance, pause: controller.pause, resume: controller.resume, reset: controller.reset };
}
