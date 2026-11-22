import { describe, expect, it } from "vitest";

import {
  createActivationChallenge,
  decryptActivationCode,
  digestActivationCode,
  isDecisionLinkCurrent,
  parseActivationKey,
  signDecisionLink,
} from "@/app/lib/supabase/membership-crypto";

const secret = parseActivationKey("12".repeat(32));
const owner = "49a519de-bc1f-4350-b126-d1fb66ca49ce";

describe("membership activation codes", () => {
  it("derives the verification digest from a six-digit code and its owner", () => {
    const { digest, encryptedCode } = createActivationChallenge(secret, owner);
    const delivered = decryptActivationCode(secret, owner, encryptedCode);

    expect(delivered).toMatch(/^[0-9]{6}$/);
    expect(digest).toEqual(digestActivationCode(secret, owner, delivered));
    expect(digest).not.toEqual(digestActivationCode(secret, "another-owner", delivered));
  });

  it("rejects ciphertext copied to another owner", () => {
    const { encryptedCode } = createActivationChallenge(secret, owner);

    expect(() => decryptActivationCode(secret, "another-owner", encryptedCode)).toThrow();
  });

  it("rejects a modified authentication tag", () => {
    const { encryptedCode } = createActivationChallenge(secret, owner);
    const [version, nonce, tag, payload] = encryptedCode.split(".");
    const modifiedTag = (tag[0] === "0" ? "1" : "0") + tag.slice(1);

    expect(() => decryptActivationCode(secret, owner, [version, nonce, modifiedTag, payload].join("."))).toThrow();
  });
});

describe("administrative decision links", () => {
  const createdAt = "2026-11-21T15:00:00Z";
  const issuedAt = Date.parse(createdAt);

  it("binds the proof to one request and one decision", () => {
    const proof = signDecisionLink(secret, owner, "approve");
    expect(isDecisionLinkCurrent(secret, owner, "approve", proof, createdAt, issuedAt)).toBe(true);
    expect(isDecisionLinkCurrent(secret, owner, "reject", proof, createdAt, issuedAt)).toBe(false);
    expect(isDecisionLinkCurrent(secret, "another-request", "approve", proof, createdAt, issuedAt)).toBe(false);
  });

  it("expires exactly 24 hours after the request was created", () => {
    const proof = signDecisionLink(secret, owner, "reject");
    const deadline = issuedAt + 24 * 60 * 60 * 1000;
    expect(isDecisionLinkCurrent(secret, owner, "reject", proof, createdAt, deadline - 1)).toBe(true);
    expect(isDecisionLinkCurrent(secret, owner, "reject", proof, createdAt, deadline)).toBe(false);
  });
});
