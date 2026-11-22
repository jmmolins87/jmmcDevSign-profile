import { describe, expect, it, vi } from "vitest";

import { renderActivationMail, renderRequestMail, sendMembershipMail } from "@/app/lib/supabase/membership-mail";

const provider = { kind: "resend", apiKey: "test-key", from: "Editorial <editorial@example.test>" } as const;
const mail = renderActivationMail("editor@example.test", "en", "012345");

describe("membership mail", () => {
  it("uses the same provider idempotency key and payload when a retry follows an ambiguous response", async () => {
    const accepted = new Map<string, string>();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (endpoint, options) => {
      expect(endpoint).toBe("https://api.resend.com/emails");
      const key = new Headers(options?.headers).get("Idempotency-Key");
      if (!key || typeof options?.body !== "string") throw new Error("Missing request body or key.");
      const previous = accepted.get(key);
      if (previous) {
        expect(options.body).toEqual(previous);
        return new Response(null, { status: 200 });
      }
      accepted.set(key, options.body);
      return new Response("temporary error with private payload", { status: 503 });
    });

    await expect(sendMembershipMail(provider, mail, "activation/1", fetcher)).resolves.toEqual({
      result: "retry",
      error: "provider-transient",
    });
    await expect(sendMembershipMail(provider, mail, "activation/1", fetcher)).resolves.toEqual({ result: "sent", error: null });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(accepted.size).toBe(1);
  });

  it("returns a fixed failure code when the provider rejects the request", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("test-key 012345", { status: 422 }));

    await expect(sendMembershipMail(provider, mail, "activation/2", fetcher)).resolves.toEqual({
      result: "failed",
      error: "provider-permanent",
    });
  });

  it("personalizes approval links and escapes user-supplied HTML", () => {
    const notification = renderRequestMail({
      siteUrl: "https://example.test",
      requestId: "request-one",
      fullName: "<script>alert(1)</script>",
      applicantEmail: "editor@example.test",
      requestedRole: "revisor",
      recipient: "admin@example.test",
      locale: "en",
      approveProof: "approve-proof",
      rejectProof: "reject-proof",
    });

    expect(notification.text).toContain("/en/admin/approval?requestId=request-one&decision=approve&proof=approve-proof");
    expect(notification.text).toContain("/en/admin/approval?requestId=request-one&decision=reject&proof=reject-proof");
    expect(notification.html).toContain("&lt;script&gt;");
    expect(notification.html).not.toContain("<script>");
  });
});
