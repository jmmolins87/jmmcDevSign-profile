/* SPEC 02 — Primitiva: pill para tags y badges.
   Solo migran las variantes "default" (outline) y "live" (teal);
   el resto queda como está, fuera de la spec. */

import type { ReactNode } from "react";

type ChipProps = {
  tone?: "default" | "live";
  className?: string;
  children: ReactNode;
};

const TONES = {
  default:
    "border border-outline-variant text-on-surface-variant font-label-caps text-label-caps",
  live: "bg-secondary-container text-on-secondary-container font-mono-code text-[10px] uppercase tracking-wider font-semibold",
} as const;

export default function Chip({
  tone = "default",
  className = "px-2.5 py-1",
  children,
}: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
