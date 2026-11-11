import type { HTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

type BadgeVariant = "neutral" | "active" | "error" | "muted";

const badgeClasses: Record<BadgeVariant, string> = {
  neutral: "border-border-strong text-on-surface-variant",
  active: "border-accent text-accent",
  error: "border-error text-error",
  muted: "border-border text-on-surface-variant",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center border px-space-sm font-mono text-mono-code uppercase tracking-[0.08em]", // taste-skill-ignore: technical status token from DESIGN.md
        badgeClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export type StatusIndicatorProps = {
  label: string;
  status?: "active" | "error" | "idle";
};

export function StatusIndicator({ label, status = "active" }: StatusIndicatorProps) {
  const statusClasses = {
    active: "bg-state-operational",
    error: "bg-state-error",
    idle: "bg-state-disabled",
  } as const;

  return (
    <span className="inline-flex items-center gap-space-sm font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{/* taste-skill-ignore: technical status token from DESIGN.md */}
      <span aria-hidden="true" className={cn("size-2", statusClasses[status])} />
      <span>{label}</span>
    </span>
  );
}
