import { describe, expect, it } from "vitest";
import { isLocale, localePath } from "@/app/lib/i18n";
import { getDemoPanelIndex, getDemoSegmentDistance } from "@/app/[locale]/_components/demo-scroll";
import { englishPublicMessages, publicMessages, publicText } from "@/app/lib/public-messages";

describe("public language routes", () => {
  it("keeps every public surface, query and fragment while changing language", () => {
    for (const path of ["/es/", "/es/login", "/es/demos", "/es/demos/agent-builder", "/es/demos/leads-workflow", "/es/demos/lead-qualification", "/es/demos/orders-realtime", "/es/demos/business-backoffice"]) {
      expect(localePath(`${path}?view=detail#trace`, "en")).toBe(`${path.replace(/^\/es/, "/en")}?view=detail#trace`);
      expect(localePath(localePath(path, "en"), "es")).toBe(path);
    }
  });
  it("leaves fragment links and external destinations intact", () => {
    expect(localePath("#demos", "en")).toBe("#demos");
    expect(localePath("https://example.test/es", "en")).toBe("https://example.test/es");
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
  it("has both dictionaries for every public message and translates operational errors", () => {
    for (const key of Object.keys(englishPublicMessages) as Array<keyof typeof englishPublicMessages>) {
      expect(publicMessages.es[key]).toBe(key);
      expect(publicMessages.en[key].trim().length).toBeGreaterThan(0);
    }
    expect(publicText("en", "Las credenciales no coinciden con ningún perfil demo.")).toBe("The credentials do not match any demo profile.");
    expect(publicText("en", "GitHub no está configurado localmente. Completa Supabase Auth para activar este proveedor.")).toBe("GitHub is unavailable in this local demo. Remote OAuth is not enabled.");
  });
});

describe("stable demo scroll segments", () => {
  it("keeps a viewport-sized dwell for mobile and desktop", () => {
    expect(getDemoSegmentDistance(812)).toBeCloseTo(730.8);
    expect(getDemoSegmentDistance(900)).toBe(810);
    expect(getDemoSegmentDistance(500)).toBe(720);
  });
  it("changes a panel only when its complete segment threshold is crossed", () => {
    expect(getDemoPanelIndex(0, 5)).toBe(0);
    expect(getDemoPanelIndex(0.199, 5)).toBe(0);
    expect(getDemoPanelIndex(0.2, 5)).toBe(1);
    expect(getDemoPanelIndex(0.399, 5)).toBe(1);
    expect(getDemoPanelIndex(1, 5)).toBe(4);
  });
});
