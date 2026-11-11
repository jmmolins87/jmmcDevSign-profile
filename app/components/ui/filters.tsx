import type { FormHTMLAttributes, ReactNode } from "react";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

export type FilterBarProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  legend: string;
  showReset?: boolean;
};

export function FilterBar({
  children,
  className,
  legend,
  showReset = true,
  ...props
}: FilterBarProps) {
  return (
    <form className={cn("border border-border bg-surface-container p-space-lg", className)} {...props}>
      <fieldset className="grid gap-space-md">
        <legend className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary">
          {legend}
        </legend>
        <div className="grid gap-space-md md:grid-cols-3">{children}</div>
        {showReset ? (
          <div className="flex justify-end border-t border-border pt-space-md">{/* taste-skill-ignore: form section rule from DESIGN.md */}
            <Button size="sm" type="reset" variant="ghost">
              Limpiar filtros
            </Button>
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}
