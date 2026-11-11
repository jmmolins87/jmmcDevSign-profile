import Link from "next/link";

import { cn } from "@/app/components/ui/utils";

export type EditorialListItem = {
  href?: string;
  id: string;
  meta?: string;
  title: string;
};

export type EditorialListProps = {
  ariaLabel: string;
  items: readonly EditorialListItem[];
};

export function EditorialList({ ariaLabel, items }: EditorialListProps) {
  return (
    <ol aria-label={ariaLabel} className="divide-y divide-border border-y border-border">{/* taste-skill-ignore: editorial list rules from DESIGN.md */}
      {items.map((item, index) => {
        const content = (
          <>
            <span className="font-mono text-mono-code text-on-surface-variant">{"{"}{String(index + 1).padStart(2, "0")}{"}"}</span>{/* taste-skill-ignore: editorial index and technical metadata from DESIGN.md */}
            <span className="font-headline text-headline-md uppercase text-primary">{item.title}</span>
            {item.meta ? <span className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{item.meta}</span> : null}{/* taste-skill-ignore: technical metadata from DESIGN.md */}
            {item.href ? <span aria-hidden="true" className="ms-auto font-mono text-mono-code text-accent">→</span> : null}{/* taste-skill-ignore: technical metadata from DESIGN.md */}
          </>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link className="grid min-h-16 grid-cols-[auto_1fr_auto_auto] items-center gap-space-md px-space-md py-space-sm hover:bg-surface-high" href={item.href}>
                {content}
              </Link>
            ) : (
              <div className={cn("grid min-h-16 grid-cols-[auto_1fr_auto_auto] items-center gap-space-md px-space-md py-space-sm")}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
