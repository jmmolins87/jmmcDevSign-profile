import type { ReactNode } from "react";

import { ProtectedSurface } from "@/app/es/auth/protected-surface";
import { SurfaceHeader } from "@/app/es/_components/surface-header";
import type { UserRole } from "@/app/es/auth/mock-session";

type DemoPageShellProps = {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
  description: string;
  eyebrow: string;
  id: string;
  title: string;
  tone?: "low" | "base";
};

export function DemoPageShell({
  allowedRoles,
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
        <ProtectedSurface allowedRoles={allowedRoles}>{children}</ProtectedSurface>
      </div>
    </main>
  );
}
