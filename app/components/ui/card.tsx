import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={cn("border border-border bg-surface-container", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn("flex flex-wrap items-start justify-between gap-space-md border-b border-border p-space-lg", className)} {...props} />; // taste-skill-ignore: editorial card rule from DESIGN.md
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-headline text-headline-md uppercase text-primary", className)} {...props} />;
}

export function CardMeta({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant", className)} {...props} />; // taste-skill-ignore: technical metadata token from DESIGN.md
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-space-lg", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <footer className={cn("border-t border-border p-space-lg", className)} {...props} />; // taste-skill-ignore: editorial card rule from DESIGN.md
}

export type CardStackProps = {
  children: ReactNode;
  className?: string;
};

export function CardStack({ children, className }: CardStackProps) {
  return <div className={cn("grid gap-space-lg", className)}>{children}</div>;
}
