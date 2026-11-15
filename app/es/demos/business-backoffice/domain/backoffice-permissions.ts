import type { BackofficePermission, BackofficeRole } from "./backoffice-types";

export const BACKOFFICE_PERMISSIONS: Record<BackofficeRole, readonly BackofficePermission[]> = {
  ADMIN: ["read", "create-order", "emit-invoice", "edit-customer", "update-stock", "export-data"],
  EDITOR: ["read", "create-order", "emit-invoice", "edit-customer", "update-stock", "export-data"],
  LECTOR: ["read"],
};

export function hasBackofficePermission(role: BackofficeRole, permission: BackofficePermission): boolean {
  return BACKOFFICE_PERMISSIONS[role].includes(permission);
}

export function assertBackofficePermission(role: BackofficeRole, permission: BackofficePermission): void {
  if (!hasBackofficePermission(role, permission)) {
    throw new Error(`Acción bloqueada: el rol ${role} no tiene permiso para ${permission}.`);
  }
}
