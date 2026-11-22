import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStorageOrigin = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: supabaseStorageOrigin ? {
    remotePatterns: [{
      hostname: supabaseStorageOrigin.hostname,
      pathname: "/storage/v1/object/public/post-covers/**",
      port: supabaseStorageOrigin.port,
      protocol: supabaseStorageOrigin.protocol.slice(0, -1) as "http" | "https",
      search: "",
    }],
  } : undefined,
  partialPrefetching: true,
  redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },
};

export default nextConfig;
