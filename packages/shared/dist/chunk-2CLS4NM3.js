// src/env.ts
import { z } from "zod";
var url = z.url();
var httpPort = z.coerce.number().int().min(1, "HTTP port must be >= 1").max(65535, "HTTP port must be <= 65535");
var apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: httpPort.default(4e3),
  // PostgreSQL (Supabase) and Redis are hard requirements of the API.
  DATABASE_URL: url,
  REDIS_URL: url,
  // Public origins/URLs so secrets like approval links are built correctly.
  WEB_URL: url,
  API_URL: url
});
var mailEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.email().or(z.string().min(3)).optional(),
  ADMIN_EMAIL: z.email().optional()
});
var approvalEnvSchema = z.object({
  APPROVAL_TOKEN_SECRET: z.string().min(16).optional()
});
var oauthEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  APPLE_CLIENT_ID: z.string().min(1).optional(),
  APPLE_CLIENT_SECRET: z.string().min(1).optional(),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional()
});
var aiEnvSchema = z.object({
  AI_PROVIDER: z.enum(["mock", "openai", "anthropic", "google"]).default("mock"),
  AI_MODEL: z.string().min(1).optional(),
  AI_API_KEY: z.string().min(1).optional()
});
var supabaseEnvSchema = z.object({
  SUPABASE_URL: url.optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).optional()
});
var authSecretEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32).optional()
});
var serverEnvSchema = apiEnvSchema.extend(mailEnvSchema.shape).extend(approvalEnvSchema.shape).extend(oauthEnvSchema.shape).extend(aiEnvSchema.shape).extend(supabaseEnvSchema.shape).extend(authSecretEnvSchema.shape);
function parseEnv(schema, source) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment variables:
${issues}`);
  }
  return result.data;
}

export {
  apiEnvSchema,
  mailEnvSchema,
  approvalEnvSchema,
  oauthEnvSchema,
  aiEnvSchema,
  supabaseEnvSchema,
  authSecretEnvSchema,
  serverEnvSchema,
  parseEnv
};
//# sourceMappingURL=chunk-2CLS4NM3.js.map