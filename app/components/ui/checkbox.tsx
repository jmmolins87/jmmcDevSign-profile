import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

export type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  description?: string;
  error?: string;
  id?: string;
  label: string;
};

export function CheckboxField({
  className,
  description,
  error,
  id,
  label,
  ...props
}: CheckboxFieldProps) {
  const generatedId = useId();
  const checkboxId = id ?? `checkbox-${generatedId}`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-space-xs">
      <div className="flex items-start gap-space-sm">
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          className={cn("mt-space-xs size-4 shrink-0 accent-accent", className)}
          id={checkboxId}
          type="checkbox"
          {...props}
        />
        <label className="text-body-md text-on-surface" htmlFor={checkboxId}>
          {label}
        </label>
      </div>
      {description ? <p className="ms-6 text-body-sm text-on-surface-variant" id={descriptionId}>{description}</p> : null}
      {error ? <p className="ms-6 text-body-sm text-error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
