import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

type FieldMessageProps = {
  description?: string;
  error?: string;
};

function FieldMessages({ description, error }: FieldMessageProps) {
  return (
    <>
      {description ? (
        <p className="text-body-sm text-on-surface-variant" data-field-description>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className="text-body-sm text-error" data-field-error role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

export type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> &
  FieldMessageProps & {
    id?: string;
    label: string;
  };

export function InputField({
  className,
  description,
  error,
  id,
  label,
  required,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-space-sm">
      <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor={inputId}>
        {label}
        {required ? <span aria-hidden="true" className="ms-space-xs text-error">*</span> : null}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "min-h-11 w-full border border-border-strong bg-surface-low px-space-md font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-state-focus", // taste-skill-ignore: technical input token from DESIGN.md
          className,
        )}
        id={inputId}
        required={required}
        {...props}
      />
      <div className="grid gap-space-xs">
        {description ? <span id={descriptionId} className="sr-only">{description}</span> : null}
        {error ? <span id={errorId} className="sr-only">{error}</span> : null}
        <FieldMessages description={description} error={error} />
      </div>
    </div>
  );
}

export type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> &
  FieldMessageProps & {
    id?: string;
    label: string;
  };

export function TextareaField({
  className,
  description,
  error,
  id,
  label,
  required,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? `textarea-${generatedId}`;
  const descriptionId = description ? `${textareaId}-description` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-space-sm">
      <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor={textareaId}>
        {label}
        {required ? <span aria-hidden="true" className="ms-space-xs text-error">*</span> : null}
      </label>
      <textarea
        aria-describedby={describedBy}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "min-h-32 w-full resize-y border border-border-strong bg-surface-low px-space-md py-space-sm font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-state-focus", // taste-skill-ignore: technical input token from DESIGN.md
          className,
        )}
        id={textareaId}
        required={required}
        {...props}
      />
      <FieldMessages description={description} error={error} />
    </div>
  );
}
