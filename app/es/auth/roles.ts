export const USER_ROLES = ["admin", "editor", "revisor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const EDITORIAL_ROLES = ["editor", "revisor"] as const;

export const SHARED_SURFACE_ROLES = ["admin", ...EDITORIAL_ROLES] as const;

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}
