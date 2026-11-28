import Link from "@/app/components/site-link";

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
  start?: number;
};

const rowClassName = "grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-space-md gap-y-space-xs px-space-md py-space-sm sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]";

export function EditorialList({ ariaLabel, items, start = 1 }: EditorialListProps) {
  return (
    <ol aria-label={ariaLabel} className="divide-y divide-border border-y border-border" start={start}>{/* taste-skill-ignore: editorial list rules from DESIGN.md */}
      {items.map((item, index) => {
        const content = (
          <>
            <span aria-hidden="true" className="col-start-1 row-start-1 font-mono text-mono-code text-on-surface-variant">{"{"}{String(start + index).padStart(2, "0")}{"}"}</span>{/* taste-skill-ignore: editorial index and technical metadata from DESIGN.md */}
            <span className="col-start-2 row-start-1 font-headline text-headline-md uppercase [overflow-wrap:anywhere] text-primary">{item.title}</span>
            {item.meta ? <span className="col-start-2 row-start-2 font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant sm:col-start-3 sm:row-start-1">{item.meta}</span> : null}{/* taste-skill-ignore: technical metadata from DESIGN.md */}
            {item.href ? <span aria-hidden="true" className="col-start-3 row-start-1 font-mono text-mono-code text-accent sm:col-start-4">→</span> : null}{/* taste-skill-ignore: technical metadata from DESIGN.md */}
          </>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link className={cn(rowClassName, "hover:bg-surface-high")} href={item.href}>
                {content}
              </Link>
            ) : (
              <div className={rowClassName}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
