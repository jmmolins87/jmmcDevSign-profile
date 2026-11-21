import type { ReactNode } from "react";

import { SurfaceHeader } from "@/app/[locale]/_components/surface-header";

type DemoPageShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  id: string;
  title: string;
  tone?: "low" | "base";
};

export function DemoPageShell({
  children,
  description,
  eyebrow,
  id,
  title,
  tone = "low",
}: DemoPageShellProps) {
  return (
    <main className={`min-h-[calc(100svh-4rem)] ${tone === "low" ? "bg-surface-lowest" : "bg-surface"} px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop`}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader description={description} eyebrow={eyebrow} id={id} title={title} />
        {children}
      </div>
    </main>
  );
}
