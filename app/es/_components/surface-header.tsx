import type { ReactNode } from "react";

import { CardMeta } from "@/app/components/ui";

type SurfaceHeaderProps = {
  description: string;
  eyebrow: string;
  id: string;
  title: string;
  action?: ReactNode;
};

export function SurfaceHeader({ description, eyebrow, id, title, action }: SurfaceHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: surface header rule from DESIGN.md */}
      <div className="grid gap-space-md">
        <CardMeta>{eyebrow}</CardMeta>
        <h1 className="max-w-5xl font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id={id}>
          {title}
        </h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
