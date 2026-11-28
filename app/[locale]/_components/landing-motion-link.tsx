"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { usePrefersReducedMotion } from "@/app/[locale]/_components/use-prefers-reduced-motion";
import { cn } from "@/app/components/ui/utils";

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

export function LandingMotionLink({ className, variant = "filled", ...props }: LandingMotionLinkProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const hover = variant === "filled"
    ? "hover:border-accent hover:bg-background hover:text-primary"
    : "hover:border-accent hover:text-accent";

  return (
    <MotionLink
      {...props}
      className={cn(className, "transition-colors", hover)}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
    />
  );
}
