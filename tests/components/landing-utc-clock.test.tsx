import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LandingUtcClock } from "@/app/es/_components/landing-utc-clock";

describe("landing local clock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-02-28T23:42:15.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates once per second and clears its interval on unmount", () => {
    const { unmount } = render(<LandingUtcClock />);

    expect(screen.getByText(/\{ TIME: \d{2}:42:15 LOCAL \}/)).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/\{ TIME: \d{2}:42:16 LOCAL \}/)).toBeInTheDocument();

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
