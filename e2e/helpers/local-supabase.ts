import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

type TestRole = "admin" | "editor" | "revisor";
let localStatus: ReturnType<typeof loadLocalSupabaseStatus> | undefined;

function runLocalSupabase(args: string[]) {
  const result = spawnSync("supabase", [...args, "--agent", "no"], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
  });
  if (result.status !== 0) throw new Error("The local Supabase command could not run.");
  return result.stdout;
}

function localEndpoint(value: string) {
  const endpoint = new URL(value);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname)) {
    throw new Error("This Playwright fixture only accepts a loopback endpoint.");
  }
  return endpoint;
}

function loadLocalSupabaseStatus() {
  const output = runLocalSupabase(["status", "--output", "env"]);
  const settings = new Map(
    [...output.matchAll(/^([A-Z_]+)="([^"\n]*)"$/gm)].map(([, key, value]) => [key, value]),
  );
  const apiUrl = settings.get("API_URL");
  const secretKey = settings.get("SECRET_KEY");
  const publishableKey = settings.get("PUBLISHABLE_KEY");
  if (!apiUrl || !secretKey || !publishableKey) {
    throw new Error("Start the local Supabase stack before running the Playwright fixtures.");
  }

  return {
    apiUrl: localEndpoint(apiUrl).origin,
    emailUrl: settings.get("MAILPIT_URL") ?? settings.get("INBUCKET_URL"),
    publishableKey,
    secretKey,
  };
}

export function readLocalSupabaseStatus() {
  return localStatus ??= loadLocalSupabaseStatus();
}

export async function createConfirmedLocalAccount({ role }: { role?: TestRole } = {}) {
  const { apiUrl, secretKey } = readLocalSupabaseStatus();
  const client = createClient(apiUrl, secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const email = `${role ?? "reader"}-${randomUUID()}@example.com`;
  const password = `${randomUUID()}-Aa9!`;
  const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error("Could not create the local test identity.");

  const id = data.user.id;
  async function dispose() {
    const { error: deleteError } = await client.auth.admin.deleteUser(id);
    if (deleteError) throw new Error("Could not clean up the local test identity.");
  }

  try {
    if (role && !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/u.test(id)) {
      throw new Error("Supabase returned a malformed test identity.");
    }
    if (role === "admin") {
      runLocalSupabase(["db", "query", "--local", `select private.provision_admin('${email}')`]);
    } else if (role === "editor" || role === "revisor") {
      runLocalSupabase([
        "db",
        "query",
        "--local",
        `insert into public.memberships (user_id, role, status, activated_at) values ('${id}', '${role}', 'active', now())`,
      ]);
    }
    return { id, email, password, dispose };
  } catch (error) {
    await dispose();
    throw error;
  }
}

export async function signInLocalAccount(page: Page, account: { email: string; password: string }) {
  const baseUrl = localEndpoint(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3099");
  await page.goto(new URL("/es/login", baseUrl).toString());
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel(/^Contraseña/).fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await page.getByText("SESIÓN ACTIVA", { exact: false }).first().waitFor();
}
