"use client";

type LandingWarpControlProps = Readonly<{
  isDisabled: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}>;

export function LandingWarpControl({ isDisabled, isPlaying, onToggle }: LandingWarpControlProps) {
  return (
    <button
      aria-disabled={isDisabled}
      aria-label={isDisabled ? "Warp pausado por preferencia de movimiento reducido" : isPlaying ? "Pausar warp continuo" : "Reanudar warp continuo"}
      aria-pressed={isPlaying}
      className="absolute bottom-space-2xl end-margin z-20 inline-flex min-h-10 items-center gap-space-sm border border-border bg-background/90 px-space-sm font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm transition-colors hover:border-accent hover:text-primary active:scale-[0.98]"
      data-hero-warp-control
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" className="text-accent">✦</span>
      <span>{isDisabled ? "WARP PAUSED" : isPlaying ? "PAUSE WARP" : "PLAY WARP"}</span>
      <span aria-hidden="true">{isDisabled || !isPlaying ? "{ ▶ }" : "{ || }"}</span>
    </button>
  );
}
