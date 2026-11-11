import { useId, type SelectHTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  description?: string;
  error?: string;
  id?: string;
  label: string;
  options: readonly SelectOption[];
};

export function SelectField({
  className,
  description,
  error,
  id,
  label,
  options,
  required,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-space-sm">
      <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor={selectId}>
        {label}
        {required ? <span aria-hidden="true" className="ms-space-xs text-error">*</span> : null}
      </label>
      <select
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "min-h-11 w-full border border-border-strong bg-surface-low px-space-md font-mono text-body-md text-on-surface focus:border-state-focus", // taste-skill-ignore: technical input token from DESIGN.md
          className,
        )}
        id={selectId}
        required={required}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? <p className="text-body-sm text-on-surface-variant" id={descriptionId}>{description}</p> : null}
      {error ? <p className="text-body-sm text-error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
