// src/api.ts
import { z } from "zod";
var ApiErrorSchema = z.object({
  status: z.number().int().min(400).max(599),
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional()
});
var ApiSuccessSchema = z.object({
  status: z.number().int().min(200).max(299),
  data: z.unknown()
});
var HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string().min(1),
  uptimeSeconds: z.number().min(0),
  timestamp: z.iso.datetime()
});
var TimestampedEventSchema = z.object({
  timestamp: z.number().int().min(0)
});

export {
  ApiErrorSchema,
  ApiSuccessSchema,
  HealthResponseSchema,
  TimestampedEventSchema
};
//# sourceMappingURL=chunk-CN5JIK7P.js.map