import { z } from "zod"

/**
 * Shared REST contracts between `apps/web` and `apps/api` (guidelines §7).
 * Growth path: `/auth/*` (Better Auth), `/approvals/:token`, `/posts`,
 * `/contact`, `/leads`, `/agents`, `/orders`, `/backoffice/*`.
 */

/** Standard error envelope for every API failure response. */
export const ApiErrorSchema = z.object({
  status: z.number().int().min(400).max(599),
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>

/** Standard success envelope for every API response. */
export const ApiSuccessSchema = z.object({
  status: z.number().int().min(200).max(299),
  data: z.unknown(),
})
export type ApiSuccess<T> = Omit<z.infer<typeof ApiSuccessSchema>, "data"> & {
  data: T
}

/** `GET /health` — used by the smoke test and CI checks. */
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string().min(1),
  uptimeSeconds: z.number().min(0),
  timestamp: z.iso.datetime(),
})

/** Timestamped socket payload contract: every event carries `timestamp` (§7). */
export const TimestampedEventSchema = z.object({
  timestamp: z.number().int().min(0),
})
