import { NextResponse, type NextRequest } from "next/server";

import { POST_SLUG_PATTERN } from "@/app/[locale]/blog/domain/post-types";
import { publicPostRepository } from "@/app/[locale]/blog/repositories/public-post-repository";
import { isLocale } from "@/app/lib/i18n";
import { refreshSupabaseSession } from "@/app/lib/supabase/proxy";

async function missingPublicPost(request: NextRequest) {
  const match = /^\/(es|en)\/blog\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return;
  const [, locale, encodedSlug] = match;
  if (encodedSlug === "editor" || encodedSlug === "not-found") return;

  const notFound = new URL(`/${locale}/blog/not-found`, request.url);
  let slug: string;
  try {
    slug = decodeURIComponent(encodedSlug);
  } catch {
    return notFound;
  }
  if (!POST_SLUG_PATTERN.test(slug)) return notFound;

  try {
    // Cache Components may already have streamed a 200 before the page calls notFound().
    if (!await publicPostRepository.hasPublishedSlug(slug)) return notFound;
  } catch {
    // The page's error boundary handles a remote error on its own read.
    console.warn("[public-posts] publication lookup unavailable");
  }
}

export async function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.split("/")[1];
  if (!locale) return NextResponse.next();
  if (!isLocale(locale)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return refreshSupabaseSession(request, await missingPublicPost(request));
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)|_not-found(?:/|$)|assets(?:/|$)|[^/]+\\.[^/]+$).*)"],
};

