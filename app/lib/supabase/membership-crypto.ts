import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import type { MembershipDecision } from "@/app/[locale]/auth/managed-types";

const CODE_PATTERN = /^[0-9]{6}$/;
const DECISION_LINK_LIFETIME_MS = 24 * 60 * 60 * 1000;

export function parseActivationKey(value: string | undefined): Buffer {
  if (!value || !/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error("ACTIVATION_CODE_ENCRYPTION_KEY must contain 32 bytes encoded as hex.");
  }
  return Buffer.from(value, "hex");
}

function deriveKey(secret: Buffer, purpose: "digest" | "delivery" | "decision-link") {
  return createHmac("sha256", secret).update(`membership/v1/${purpose}`).digest();
}

export function signDecisionLink(secret: Buffer, requestId: string, decision: MembershipDecision) {
  return createHmac("sha256", deriveKey(secret, "decision-link")).update(`${requestId}:${decision}`).digest("hex");
}

export function isDecisionLinkCurrent(
  secret: Buffer,
  requestId: string,
  decision: MembershipDecision,
  proof: string,
  createdAt: string,
  now = Date.now(),
) {
  if (!/^[0-9a-f]{64}$/.test(proof) || !(now < Date.parse(createdAt) + DECISION_LINK_LIFETIME_MS)) return false;
  const expected = signDecisionLink(secret, requestId, decision);
  return timingSafeEqual(Buffer.from(proof, "hex"), Buffer.from(expected, "hex"));
}

export function digestActivationCode(secret: Buffer, userId: string, code: string) {
  return createHmac("sha256", deriveKey(secret, "digest")).update(`${userId}:${code}`).digest("hex");
}

export function createActivationChallenge(secret: Buffer, userId: string) {
  const code = String(randomInt(1_000_000)).padStart(6, "0");
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret, "delivery"), nonce);
  cipher.setAAD(Buffer.from(userId));
  const payload = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  return {
    digest: digestActivationCode(secret, userId, code),
    encryptedCode: ["v1", nonce.toString("hex"), cipher.getAuthTag().toString("hex"), payload.toString("hex")].join("."),
  };
}

export function decryptActivationCode(secret: Buffer, userId: string, encryptedCode: string) {
  const match = /^v1\.([0-9a-f]{24})\.([0-9a-f]{32})\.([0-9a-f]{12})$/.exec(encryptedCode);
  if (!match) throw new Error("Invalid activation delivery.");

  const [, nonce, tag, payload] = match;
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret, "delivery"), Buffer.from(nonce, "hex"));
  decipher.setAAD(Buffer.from(userId));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  const code = Buffer.concat([decipher.update(Buffer.from(payload, "hex")), decipher.final()]).toString("utf8");
  if (!CODE_PATTERN.test(code)) throw new Error("Invalid activation delivery.");
  return code;
}
