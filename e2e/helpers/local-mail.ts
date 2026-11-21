import { expect, type APIRequestContext } from "@playwright/test";

import { readLocalSupabaseStatus } from "./local-supabase";

type MailSummary = { ID: string; Subject: string };
type Mail = { HTML: string; Text: string };

export function requireLocalSite(baseURL: string | undefined) {
  if (!baseURL) throw new Error("Missing Playwright base URL.");
  const origin = new URL(baseURL);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)) {
    throw new Error("Authentication fixtures must only use a loopback site.");
  }
  return origin.origin;
}

export async function waitForLocalMail(api: APIRequestContext, recipient: string, subject: RegExp, bodyIncludes?: string) {
  const { emailUrl } = readLocalSupabaseStatus();
  if (!emailUrl) throw new Error("The local Supabase CLI did not expose Mailpit.");
  const origin = new URL(emailUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)) {
    throw new Error("The mail fixture only accepts a loopback endpoint.");
  }

  let result: Mail | undefined;
  await expect.poll(async () => {
    const url = new URL("/api/v1/search", origin);
    url.searchParams.set("query", `to:${recipient}`);
    const list = await api.get(url.href);
    if (!list.ok()) return false;
    const { messages } = await list.json() as { messages?: MailSummary[] };
    for (const item of messages ?? []) {
      if (!subject.test(item.Subject)) continue;
      const response = await api.get(new URL(`/api/v1/message/${encodeURIComponent(item.ID)}`, origin).href);
      if (!response.ok()) continue;
      const mail = await response.json() as Mail;
      if (bodyIncludes && !mail.Text.includes(bodyIncludes) && !mail.HTML.includes(bodyIncludes)) continue;
      result = mail;
      return true;
    }
    return false;
  }, { message: "The expected email did not arrive in local Mailpit.", timeout: 15_000 }).toBe(true);
  if (!result) throw new Error("Missing local Mailpit response.");
  return result;
}

export function localMailLink(mail: Mail, pathname: string, baseURL: string, decision?: "approve" | "reject") {
  const origin = requireLocalSite(baseURL);
  for (const match of mail.HTML.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll("&amp;", "&"));
    if (url.pathname === pathname && url.origin === origin && (!decision || url.searchParams.get("decision") === decision)) return url;
  }
  throw new Error("The email did not contain the expected local link.");
}
