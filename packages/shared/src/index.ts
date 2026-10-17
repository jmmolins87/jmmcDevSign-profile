/**
 * Public entry point of `@jmmcdev/shared`.
 * Sub-packages remain available via the paths defined in package.json exports.
 */

export {
  apiEnvSchema,
  approvalEnvSchema,
  aiEnvSchema,
  authSecretEnvSchema,
  mailEnvSchema,
  oauthEnvSchema,
  parseEnv,
  serverEnvSchema,
  supabaseEnvSchema,
  type ApiEnv,
  type ServerEnv,
} from "./env"
export {
  ApiErrorSchema,
  ApiSuccessSchema,
  HealthResponseSchema,
  TimestampedEventSchema,
  type ApiError,
  type ApiSuccess,
} from "./api"
export {
  LATENCY_DEBOUNCE_MS,
  PRESENCE_PING_INTERVAL_MS,
  socketEventNames,
  socketEvents,
  type SocketEventName,
} from "./events"
