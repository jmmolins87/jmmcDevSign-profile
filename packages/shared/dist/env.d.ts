import { z } from 'zod';

/** Variables required by `apps/api` to boot. */
declare const apiEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodURL;
    REDIS_URL: z.ZodURL;
    WEB_URL: z.ZodURL;
    API_URL: z.ZodURL;
}, z.core.$strip>;
/** Email transport and admin workflow (used by Resend in prod, Mailpit locally). */
declare const mailEnvSchema: z.ZodObject<{
    RESEND_API_KEY: z.ZodOptional<z.ZodString>;
    MAIL_FROM: z.ZodOptional<z.ZodUnion<[z.ZodEmail, z.ZodString]>>;
    ADMIN_EMAIL: z.ZodOptional<z.ZodEmail>;
}, z.core.$strip>;
/** Admin approval flow secrets (guidelines §5). */
declare const approvalEnvSchema: z.ZodObject<{
    APPROVAL_TOKEN_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** OAuth providers (Better Auth, guidelines §5). */
declare const oauthEnvSchema: z.ZodObject<{
    GOOGLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GOOGLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    APPLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    APPLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GITHUB_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GITHUB_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** AI settings (demo 05/07) — provider swappable by env, guidelines §4. */
declare const aiEnvSchema: z.ZodObject<{
    AI_PROVIDER: z.ZodDefault<z.ZodEnum<{
        mock: "mock";
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
    }>>;
    AI_MODEL: z.ZodOptional<z.ZodString>;
    AI_API_KEY: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Supabase Storage. The service role key is server-only, never exposed. */
declare const supabaseEnvSchema: z.ZodObject<{
    SUPABASE_URL: z.ZodOptional<z.ZodURL>;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodOptional<z.ZodString>;
    SUPABASE_STORAGE_BUCKET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Better Auth secret (sessions cookies, guidelines §4). */
declare const authSecretEnvSchema: z.ZodObject<{
    BETTER_AUTH_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Full server environment (superset) for type-safe access in `apps/api`. */
declare const serverEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodURL;
    REDIS_URL: z.ZodURL;
    WEB_URL: z.ZodURL;
    API_URL: z.ZodURL;
    RESEND_API_KEY: z.ZodOptional<z.ZodString>;
    MAIL_FROM: z.ZodOptional<z.ZodUnion<[z.ZodEmail, z.ZodString]>>;
    ADMIN_EMAIL: z.ZodOptional<z.ZodEmail>;
    APPROVAL_TOKEN_SECRET: z.ZodOptional<z.ZodString>;
    GOOGLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GOOGLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    APPLE_CLIENT_ID: z.ZodOptional<z.ZodString>;
    APPLE_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GITHUB_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GITHUB_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    AI_PROVIDER: z.ZodDefault<z.ZodEnum<{
        mock: "mock";
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
    }>>;
    AI_MODEL: z.ZodOptional<z.ZodString>;
    AI_API_KEY: z.ZodOptional<z.ZodString>;
    SUPABASE_URL: z.ZodOptional<z.ZodURL>;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodOptional<z.ZodString>;
    SUPABASE_STORAGE_BUCKET: z.ZodOptional<z.ZodString>;
    BETTER_AUTH_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type ApiEnv = z.infer<typeof apiEnvSchema>;
type ServerEnv = z.infer<typeof serverEnvSchema>;
/**
 * Parse and freeze an environment. Throws a readable error listing every
 * missing/invalid variable, so a misconfigured boot fails immediately.
 */
declare function parseEnv<T extends z.ZodType>(schema: T, source: unknown): z.infer<T>;

export { aiEnvSchema, apiEnvSchema, approvalEnvSchema, authSecretEnvSchema, mailEnvSchema, oauthEnvSchema, parseEnv, serverEnvSchema, supabaseEnvSchema };
export type { ApiEnv, ServerEnv };
