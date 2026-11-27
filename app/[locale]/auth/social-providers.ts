export const socialProviders = {
  github: "GitHub",
  apple: "Apple",
  google: "Google",
} as const;

export type SocialProvider = keyof typeof socialProviders;

export function isSocialProvider(value: string): value is SocialProvider {
  return Object.hasOwn(socialProviders, value);
}
