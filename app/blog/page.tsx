/* SPEC 10 — Paso 7: listado /blog (y /en/blog vía rewrite del proxy).
   Lee posts de la capa de datos (mock o Supabase) resueltos para el
   locale; hreflang es /blog ↔ /en/blog. */

import type { Metadata } from "next";
import Link from "next/link";

import { getPosts } from "@/lib/data";
import { localizePath } from "@/lib/i18n/config";
import { getDict, getLocale } from "@/lib/i18n/server";
import { formatPostMeta } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDict();
  return {
    title: dict.meta.blog,
    description: dict.sections.blogListing.intro,
    alternates: {
      canonical: localizePath(locale, "/blog"),
      languages: { es: "/blog", en: "/en/blog" },
    },
  };
}

export default async function BlogListingPage() {
  const locale = await getLocale();
  const dict = await getDict();
  const { blog, blogListing } = dict.sections;
  const posts = await getPosts(locale);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-24">
      {/* Eyebrow + hairline (mismo patrón que SectionHeading) */}
      <div className="flex items-center gap-space-md mb-10">
        <span className="font-mono-code text-mono-code text-primary uppercase tracking-[0.06em]">
          {blogListing.eyebrow}
        </span>
        <div className="h-[1px] flex-1 bg-outline-variant" />
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
        {blog.name}
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-16">
        {blogListing.intro}
      </p>

      {posts.length === 0 ? (
        <p className="font-mono-code text-mono-code text-on-surface-variant border-t border-outline-variant pt-8">
          {blogListing.empty}
        </p>
      ) : (
        <ul className="border-t border-outline-variant">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-outline-variant">
              <Link
                href={localizePath(locale, `/blog/${post.slug}`)}
                className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-8 items-center focus:outline-none focus-visible:bg-surface-container-low"
              >
                {/* Portada */}
                <div className="md:col-span-3 relative aspect-[16/10] rounded-[14px] overflow-hidden bg-surface-variant">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                    role="img"
                    aria-label={post.cover.alt}
                    style={{ backgroundImage: `url('${post.cover.url}')` }}
                  />
                </div>
                {/* Cuerpo */}
                <div className="md:col-span-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] uppercase">
                      {post.category}
                    </span>
                    <span className="font-mono-code text-[11px] text-outline">
                      {formatPostMeta(
                        post.publishedAt,
                        post.readingMinutes,
                        blog.months,
                        blog.minRead,
                      )}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-normal transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {post.excerpt}
                  </p>
                </div>
                {/* Flecha */}
                <div className="md:col-span-3 hidden md:flex justify-end">
                  <span className="material-symbols-outlined text-[24px] text-outline transition-colors group-hover:text-primary">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
