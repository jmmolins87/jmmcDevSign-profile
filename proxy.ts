import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { publicPostRepository } from "@/app/es/blog/repositories/public-post-repository";

export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").pop();
  if (!slug || slug === "editor" || slug === "not-found") return NextResponse.next();

  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    // Cache Components may have already streamed a 200 shell when notFound() runs in the page.
    // Resolve invalid path segments before rendering so the public contract remains a real 404.
    return NextResponse.rewrite(new URL("/es/blog/not-found", request.url));
  }

  const post = await publicPostRepository.getPublishedBySlug(decodedSlug);
  // Keep this request-time guard in Proxy; page.tsx still calls notFound() as its render fallback.
  return post ? NextResponse.next() : NextResponse.rewrite(new URL("/es/blog/not-found", request.url));
}

export const config = {
  matcher: "/es/blog/:slug",
};

