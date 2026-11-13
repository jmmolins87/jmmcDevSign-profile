"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Card } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

export type LandingCarouselPost = {
  category: string;
  date: string;
  description: string;
  href: string;
  id: string;
  image: string;
  imageAlt: string;
  readingTime: string;
  title: string;
};

function SidePost({ label, post }: Readonly<{ label: "PREV_POST" | "NEXT_POST"; post?: LandingCarouselPost }>) {
  return (
    <article aria-hidden="true" className="hidden min-h-80 flex-col justify-between bg-surface-container-high p-space-md opacity-35 blur-[1px] lg:col-span-2 lg:flex">
      <span className="font-mono text-mono-code text-accent">{`{ ${label} }`}</span>
      {post ? (
        <>
          <span className="font-headline text-headline-md uppercase leading-none text-on-surface-variant">{post.title}</span>
          <span className="font-mono text-[0.6875rem] uppercase text-outline">{post.category} / {post.readingTime}</span>
        </>
      ) : (
        <span className="font-headline text-headline-md uppercase leading-none text-outline">{label === "PREV_POST" ? "Inicio del archivo" : "Fin del archivo"}</span>
      )}
    </article>
  );
}

export function LandingBlogCarousel({ posts }: Readonly<{ posts: readonly LandingCarouselPost[] }>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = usePrefersReducedMotion();
  const activePost = posts[activeIndex];
  const previousPost = activeIndex > 0 ? posts[activeIndex - 1] : undefined;
  const nextPost = activeIndex < posts.length - 1 ? posts[activeIndex + 1] : undefined;

  if (!activePost) {
    return null;
  }

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => Math.min(posts.length - 1, Math.max(0, current + direction)));
  };

  return (
    <div aria-label="Carrusel de publicaciones técnicas" aria-roledescription="carrusel" className="grid gap-space-lg lg:grid-cols-12" role="region">
      <SidePost label="PREV_POST" post={previousPost} />
      <Card className="flex h-[50rem] flex-col p-space-md md:p-space-xl lg:col-span-8 lg:h-[32rem]">
        <div className="min-h-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, transform: "translateX(0)" }}
              className="grid gap-space-lg md:grid-cols-12 md:items-center md:gap-space-xl"
              exit={{ opacity: 0, transform: shouldReduceMotion ? "translateX(0)" : "translateX(-1rem)" }}
              initial={{ opacity: 0, transform: shouldReduceMotion ? "translateX(0)" : "translateX(1rem)" }}
              key={activePost.id}
              transition={{ duration: shouldReduceMotion ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative aspect-[4/3] overflow-clip bg-surface-container-highest md:col-span-5">
                <Image alt={activePost.imageAlt} className="object-cover grayscale contrast-125" fill sizes="(min-width: 1024px) 34vw, 90vw" src={activePost.image} />
                <span className="absolute top-space-sm start-space-sm bg-background/90 px-space-sm py-space-xs font-mono text-mono-code text-accent">{`{ ${String(activeIndex + 1).padStart(2, "0")} // FEATURED }`}</span>
              </div>
              <div className="flex h-full flex-col justify-between gap-space-lg md:col-span-7">
                <div>
                  <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
                    <span className="text-accent">{`{ ${activePost.category} }`}</span>
                    <span>{activePost.date}</span>
                  </div>
                  <h3 className="font-headline text-headline-lg uppercase leading-tight text-primary">{activePost.title}</h3>
                  <p className="mt-space-sm text-body-md text-secondary">{activePost.description}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-md border-t border-border pt-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
                  <span>{`{ TIEMPO DE LECTURA: ${activePost.readingTime} }`}</span>
                  <Link className="text-primary transition-colors hover:text-accent" href={activePost.href}>[ LEER DOSSIER ] <span className="text-accent">→</span></Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-space-lg flex shrink-0 flex-wrap items-center justify-between gap-space-md border-t border-border pt-space-md font-mono text-mono-code text-on-surface-variant">
          <span className="text-accent">✦</span>
          <div className="flex items-center gap-space-sm">
            <button aria-label="Publicación anterior" className="inline-flex min-h-10 min-w-10 items-center justify-center border border-border text-primary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30" disabled={!previousPost} onClick={() => move(-1)} type="button">←</button>
            <button aria-label="Publicación siguiente" className="inline-flex min-h-10 min-w-10 items-center justify-center border border-border text-primary transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30" disabled={!nextPost} onClick={() => move(1)} type="button">→</button>
          </div>
          <span>{`{ ${String(activeIndex + 1).padStart(2, "0")} / ${String(posts.length).padStart(2, "0")} }`}</span>
        </div>
      </Card>
      <SidePost label="NEXT_POST" post={nextPost} />
    </div>
  );
}
