"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

const MotionLink = motion.create(Link);

type LandingMotionLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onAnimationStart"
  | "onDrag"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDragStart"
> & Readonly<{
  variant?: "filled" | "outline";
}>;

export function LandingMotionLink({ variant = "filled", ...props }: LandingMotionLinkProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const hover = variant === "filled"
    ? {
        backgroundColor: "var(--sys-color-background)",
        borderColor: "var(--sys-color-accent)",
        color: "var(--sys-color-primary)",
      }
    : {
        borderColor: "var(--sys-color-accent)",
        color: "var(--sys-color-accent)",
      };

  return (
    <MotionLink
      {...props}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
    />
  );
}
