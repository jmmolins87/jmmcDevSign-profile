import { z } from 'zod';

/**
 * Shared REST contracts between `apps/web` and `apps/api` (guidelines §7).
 * Growth path: `/auth/*` (Better Auth), `/approvals/:token`, `/posts`,
 * `/contact`, `/leads`, `/agents`, `/orders`, `/backoffice/*`.
 */
/** Standard error envelope for every API failure response. */
declare const ApiErrorSchema: z.ZodObject<{
    status: z.ZodNumber;
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
type ApiError = z.infer<typeof ApiErrorSchema>;
/** Standard success envelope for every API response. */
declare const ApiSuccessSchema: z.ZodObject<{
    status: z.ZodNumber;
    data: z.ZodUnknown;
}, z.core.$strip>;
type ApiSuccess<T> = Omit<z.infer<typeof ApiSuccessSchema>, "data"> & {
    data: T;
};
/** `GET /health` — used by the smoke test and CI checks. */
declare const HealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    service: z.ZodString;
    uptimeSeconds: z.ZodNumber;
    timestamp: z.ZodISODateTime;
}, z.core.$strip>;
/** Timestamped socket payload contract: every event carries `timestamp` (§7). */
declare const TimestampedEventSchema: z.ZodObject<{
    timestamp: z.ZodNumber;
}, z.core.$strip>;

export { ApiErrorSchema, ApiSuccessSchema, HealthResponseSchema, TimestampedEventSchema };
export type { ApiError, ApiSuccess };
