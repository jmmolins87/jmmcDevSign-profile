"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Badge, Card, CardContent, CardHeader, CardMeta, CardTitle } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type LandingProject = {
  description: string;
  name: string;
  stack: readonly string[];
};

export function LandingProjects({ projects }: Readonly<{ projects: readonly LandingProject[] }>) {
  const scope = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = scope.current;
      const cards = Array.from(root?.querySelectorAll<HTMLElement>("[data-project-card]") ?? []);

      if (!root || cards.length === 0) {
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 28 });
      const batchTriggers = ScrollTrigger.batch(cards, {
        batchMax: 3,
        interval: 0.08,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, duration: 0.62, ease: "power3.out", overwrite: "auto", stagger: 0.08, y: 0 }),
        onLeaveBack: (batch) => gsap.to(batch, { autoAlpha: 0, duration: 0.32, ease: "power2.in", overwrite: "auto", y: 28 }),
        start: "top 86%",
      });

      return () => batchTriggers.forEach((trigger) => trigger.kill());
    },
    { dependencies: [prefersReducedMotion], revertOnUpdate: true, scope },
  );

  return (
    <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-3" ref={scope}>
      {projects.map((project, index) => (
        <Card className="group flex min-h-[22rem] flex-col transition-colors hover:border-accent" data-project-card key={project.name}>
          <CardHeader className="min-h-32">
            <div className="grid gap-space-xs">
              <CardMeta>{`PROJECT / ${String(index + 1).padStart(2, "0")}`}</CardMeta>
              <CardTitle className="mt-space-sm">{project.name}</CardTitle>
            </div>
            <span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant transition-colors group-hover:text-accent">✦</span>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between gap-space-xl">
            <p className="text-body-md text-on-surface-variant">{project.description}</p>
            <div className="grid gap-space-sm border-t border-border pt-space-md">
              <span className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">Stack / implementación</span>
              <div className="flex flex-wrap gap-space-xs">
                {project.stack.map((technology) => <Badge key={technology}>{technology}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
