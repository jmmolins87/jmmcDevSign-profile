import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_LOCALE_HANDOFF_KEY,
  consumeAuthLocaleDraft,
  createAuthLocaleDraftStore,
  saveAuthLocaleDraft,
  type AuthLocaleDraft,
} from "@/app/[locale]/login/auth-locale-handoff";

const registrationDraft: AuthLocaleDraft = {
  view: "register",
  email: "ada@example.test",
  fullName: "Ada Example",
  requestedRole: "revisor",
};

afterEach(() => window.sessionStorage.clear());

describe("authentication locale handoff", () => {
  it("persists only allowlisted safe fields even when the caller passes credentials", () => {
    const input = { ...registrationDraft, password: "never-persist-this", token: "never-persist-token" };

    expect(saveAuthLocaleDraft(input)).toBe(true);

    expect(JSON.parse(window.sessionStorage.getItem(AUTH_LOCALE_HANDOFF_KEY)!)).toEqual({ version: 1, ...registrationDraft });
  });

  it("restores a draft once and removes its stored record before returning it", () => {
    saveAuthLocaleDraft(registrationDraft);

    expect(consumeAuthLocaleDraft()).toEqual(registrationDraft);

    expect(window.sessionStorage.getItem(AUTH_LOCALE_HANDOFF_KEY)).toBeNull();
    expect(consumeAuthLocaleDraft()).toBeNull();
  });

  it.each([
    "{broken",
    JSON.stringify({ version: 1, ...registrationDraft, token: "unexpected" }),
    JSON.stringify({ version: 1, ...registrationDraft, requestedRole: "admin" }),
    JSON.stringify({ version: 1, ...registrationDraft, view: "unknown" }),
    JSON.stringify({ version: 1, ...registrationDraft, fullName: 123 }),
    JSON.stringify({ version: 2, ...registrationDraft }),
  ])("discards a malformed or unsupported stored draft without restoring fields: %s", (record) => {
    window.sessionStorage.setItem(AUTH_LOCALE_HANDOFF_KEY, record);

    expect(consumeAuthLocaleDraft()).toBeNull();

    expect(window.sessionStorage.getItem(AUTH_LOCALE_HANDOFF_KEY)).toBeNull();
  });

  it("continues without a draft when session storage is denied", () => {
    const deniedStorage = {
      getItem: () => { throw new DOMException("Storage denied", "SecurityError"); },
      setItem: () => { throw new DOMException("Storage denied", "SecurityError"); },
      removeItem: () => { throw new DOMException("Storage denied", "SecurityError"); },
    };

    expect(saveAuthLocaleDraft(registrationDraft, deniedStorage)).toBe(false);
    expect(consumeAuthLocaleDraft(deniedStorage)).toBeNull();
  });

  it("refuses to restore a draft if its stored record cannot be consumed", () => {
    const storage = {
      getItem: () => JSON.stringify({ version: 1, ...registrationDraft }),
      setItem: () => undefined,
      removeItem: () => { throw new DOMException("Storage denied", "SecurityError"); },
    };

    expect(consumeAuthLocaleDraft(storage)).toBeNull();
  });

  it("loads the client draft only after subscribing and keeps the server snapshot empty", () => {
    const load = vi.fn(() => registrationDraft);
    const store = createAuthLocaleDraftStore(load);
    const listener = vi.fn();
    expect(store.getSnapshot()).toBeNull();
    expect(store.getServerSnapshot()).toBeNull();

    const unsubscribe = store.subscribe(listener);

    expect(store.getSnapshot()).toEqual(registrationDraft);
    expect(store.getServerSnapshot()).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.subscribe(listener)();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
