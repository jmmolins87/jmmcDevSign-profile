export function hasSupabaseSessionCookie(url: string, cookies: readonly { name: string }[]) {
  // Supabase derives its default storage key from the first part of the Auth hostname.
  const authCookie = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  return cookies.some(({ name }) => name === authCookie || name.startsWith(`${authCookie}.`));
}
