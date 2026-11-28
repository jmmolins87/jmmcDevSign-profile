export const demoGuideIds = ["agent", "workflow", "qualification", "orders", "backoffice"] as const;

export type DemoGuideId = (typeof demoGuideIds)[number];

export function demoGuidePreferenceKey(demo: DemoGuideId): string {
  return `jmmcdevsign:demo-guide:${demo}:v1`;
}
