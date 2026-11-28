"use client";

import { useState } from "react";

import { EditorialList, type EditorialListItem } from "@/app/components/ui/editorial-list";
import { useCopy } from "@/app/lib/locale-context";

const pageSizes = [3, 6, 9, 12] as const;
const copy = {
  es: {
    archive: "Archivo de publicaciones",
    pagination: "Paginación de publicaciones",
    size: "Publicaciones por página",
    previous: "Página anterior",
    next: "Página siguiente",
    range: (first: number, last: number, total: number) => `${first}–${last} de ${total}`,
  },
  en: {
    archive: "Publication archive",
    pagination: "Publication pagination",
    size: "Posts per page",
    previous: "Previous page",
    next: "Next page",
    range: (first: number, last: number, total: number) => `${first}–${last} of ${total}`,
  },
};

const pageButtonClass = "inline-flex size-11 items-center justify-center border border-border bg-surface text-primary hover:border-accent hover:text-accent active:bg-surface-high disabled:opacity-40";

export function LandingBlogList({ items }: Readonly<{ items: readonly EditorialListItem[] }>) {
  const labels = useCopy(copy);
  const [pageSize, setPageSize] = useState<number>(pageSizes[0]);
  const [pageIndex, setPageIndex] = useState(0);
  const lastPageIndex = Math.max(0, Math.ceil(items.length / pageSize) - 1);
  const page = Math.min(pageIndex, lastPageIndex);
  const start = page * pageSize;
  const end = Math.min(start + pageSize, items.length);

  return (
    <div>
      <EditorialList ariaLabel={labels.archive} items={items.slice(start, end)} start={start + 1} />
      <nav aria-label={labels.pagination} className="flex flex-wrap items-center justify-between gap-space-md pt-space-md font-mono text-mono-code text-on-surface-variant">
        <label className="flex flex-wrap items-center gap-space-sm">
          {labels.size}
          <select
            className="min-h-11 border border-border bg-surface px-space-sm text-primary"
            onChange={(event) => {
              setPageSize(Number(event.currentTarget.value));
              setPageIndex(0);
            }}
            value={pageSize}
          >
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-space-sm">
          <span aria-atomic="true" className="me-space-xs tabular-nums" role="status">{labels.range(start + 1, end, items.length)}</span>
          <button aria-label={labels.previous} className={pageButtonClass} disabled={page === 0} onClick={() => setPageIndex(page - 1)} type="button">←</button>
          <button aria-label={labels.next} className={pageButtonClass} disabled={page >= lastPageIndex} onClick={() => setPageIndex(page + 1)} type="button">→</button>
        </div>
      </nav>
    </div>
  );
}
