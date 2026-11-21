export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { validateSupabaseDeploymentEnv } = await import("@/app/lib/supabase/service-env");
  validateSupabaseDeploymentEnv();
}
