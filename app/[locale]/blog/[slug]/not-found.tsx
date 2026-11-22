"use client";

import Link from "next/link";
import { useLocale } from "@/app/lib/locale-context";
import { postNotFoundCopy } from "@/app/[locale]/blog/not-found-copy";

export default function BlogPostNotFound() {
  const locale = useLocale();
  const copy = postNotFoundCopy[locale];

  return (
    <main className="grid min-h-[calc(100svh-4rem)] place-items-center bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <section className="w-full max-w-2xl border border-border bg-surface-container-lowest p-space-lg sm:p-space-xl">
        <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent">{`{ 404 // POST NOT FOUND }`}</p>
        <h1 className="mt-space-md font-headline text-headline-xl-mobile uppercase text-primary sm:text-headline-xl">{copy.title}</h1>
        <p className="mt-space-sm text-body-md text-on-surface-variant">{copy.description}</p>
        <Link className="mt-space-lg inline-flex min-h-11 items-center border border-border px-space-md font-headline text-label-caps uppercase text-primary hover:border-accent" href={`/${locale}/`}>{copy.back}</Link>
      </section>
    </main>
  );
}

