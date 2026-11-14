import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] place-items-center bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <section className="w-full max-w-2xl border border-border bg-surface-container-lowest p-space-lg sm:p-space-xl">
        <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent">{`{ 404 // POST NOT FOUND }`}</p>
        <h1 className="mt-space-md font-headline text-headline-xl-mobile uppercase text-primary sm:text-headline-xl">Esta publicación no está disponible</h1>
        <p className="mt-space-sm text-body-md text-on-surface-variant">El slug no existe o el documento todavía no está publicado.</p>
        <Link className="mt-space-lg inline-flex min-h-11 items-center border border-border px-space-md font-headline text-label-caps uppercase text-primary hover:border-accent" href="/es/">[ VOLVER AL PORTFOLIO ]</Link>
      </section>
    </main>
  );
}

