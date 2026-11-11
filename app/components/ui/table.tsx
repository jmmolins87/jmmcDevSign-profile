import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

export type DataTableColumn<T> = {
  header: string;
  key: string;
  render: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  caption: string;
  columns: readonly DataTableColumn<T>[];
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
  rows: readonly T[];
};

export function DataTable<T>({
  caption,
  columns,
  emptyMessage = "No hay registros para mostrar.",
  getRowKey,
  rows,
}: DataTableProps<T>) {
  const firstColumnKey = columns[0]?.key;

  if (rows.length === 0) {
    return <p className="border border-border p-space-lg text-body-md text-on-surface-variant" role="status">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="min-w-full border-collapse text-start text-body-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-high text-left font-headline text-label-caps uppercase tracking-[0.08em] text-primary">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-border px-space-md py-space-sm" key={column.key} scope="col">{/* taste-skill-ignore: table rule from DESIGN.md */}
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-b border-border last:border-b-0 hover:bg-surface-high" key={getRowKey(row, index)}> {/* taste-skill-ignore: table rule from DESIGN.md */}
              {columns.map((column) => (
                <td className={cn("px-space-md py-space-sm text-on-surface-variant", column.key === firstColumnKey && "font-mono text-mono-code text-primary")} key={column.key}> {/* taste-skill-ignore: table metadata token from DESIGN.md */}
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
