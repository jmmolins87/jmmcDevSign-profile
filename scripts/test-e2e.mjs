import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const siteUrl = "http://127.0.0.1:3099";
const status = spawnSync("supabase", ["status", "--agent", "no", "--output", "json"], {
  encoding: "utf8",
  env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
});
if (status.status !== 0) {
  throw new Error("Start this repository's local Supabase stack before running E2E tests.");
}

const { API_URL, PUBLISHABLE_KEY, SECRET_KEY } = JSON.parse(status.stdout);
if (API_URL !== "http://127.0.0.1:54321" ||
    !PUBLISHABLE_KEY?.startsWith("sb_publishable_") ||
    !SECRET_KEY?.startsWith("sb_secret_")) {
  throw new Error("E2E requires the local Supabase API and its local keys.");
}

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: siteUrl,
  SUPABASE_SECRET_KEY: SECRET_KEY,
  ACTIVATION_CODE_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
  MEMBERSHIP_MAIL_CRON_SECRET: randomBytes(32).toString("base64url"),
  MEMBERSHIP_MAIL_FROM: "editorial@local.test",
  ADMIN_NOTIFICATION_EMAIL: "admin@jmmcdevsign.es",
  PLAYWRIGHT_BASE_URL: siteUrl,
};

for (const args of [["build"], ["exec", "playwright", "test", ...process.argv.slice(2)]]) {
  const result = spawnSync("pnpm", args, { env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
