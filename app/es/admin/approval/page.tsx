import { ProtectedSurface } from "@/app/es/auth/protected-surface";
import { SurfaceHeader } from "@/app/es/_components/surface-header";
import { ApprovalPanel } from "@/app/es/admin/approval/approval-panel";

export default function ApprovalPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader
          description="Revisa solicitudes de acceso y cambia su estado sin salir del registro operativo."
          eyebrow="03 / approval desk"
          id="approval-title"
          title="Aprobación de accesos"
        />
        <ProtectedSurface allowedRoles={["admin"]}>
          <ApprovalPanel />
        </ProtectedSurface>
      </div>
    </main>
  );
}
