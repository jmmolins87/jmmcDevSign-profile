import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-background hover:text-primary",
  secondary: "border border-border-strong bg-transparent text-primary hover:border-accent hover:text-primary",
  ghost: "border border-transparent bg-transparent text-on-surface-variant hover:border-border hover:text-primary",
  accent: "border border-accent bg-accent text-primary-foreground hover:border-accent-text hover:bg-background hover:text-accent-text",
  danger: "border border-error bg-transparent text-error hover:bg-error-container hover:text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-space-sm text-body-sm",
  md: "min-h-11 px-space-md text-label-caps",
  lg: "min-h-12 px-space-lg text-label-caps",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-space-sm font-headline uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
