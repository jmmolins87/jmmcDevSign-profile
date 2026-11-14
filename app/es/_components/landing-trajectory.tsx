"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Card, CardContent } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type TrajectoryEntry = {
  company: string;
  detail: string;
  period: string;
  role: string;
};

export function LandingTrajectory({ entries }: Readonly<{ entries: readonly TrajectoryEntry[] }>) {
  const scope = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = scope.current;
      const cards = Array.from(root?.querySelectorAll<HTMLElement>("[data-trajectory-card]") ?? []);
      const progressLine = root?.querySelector<HTMLElement>("[data-trajectory-progress]");
      if (!root || !progressLine || cards.length === 0) {
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
        gsap.set(progressLine, { autoAlpha: 0, height: "100%" });
        return;
      }

      gsap.from(cards, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          end: "bottom 72%",
          start: "top 84%",
          toggleActions: "play reverse play reverse",
          trigger: root,
        },
        stagger: 0.12,
        y: 28,
      });

      gsap.to(progressLine, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          end: "bottom 72%",
          start: "top 84%",
          scrub: 0.6,
          trigger: root,
        },
      });
    },
    { dependencies: [prefersReducedMotion], revertOnUpdate: true, scope },
  );

  return (
    <div className="relative" ref={scope}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 z-0 w-px bg-border lg:start-1/2 lg:-translate-x-1/2">
        <span className="block h-0 w-full origin-top bg-accent" data-trajectory-progress />
      </div>
      <ol className="relative z-10 grid gap-0 ps-space-lg lg:ps-0">
        {entries.map((entry, index) => (
          <li className="relative grid gap-space-lg lg:grid-cols-2 lg:gap-space-2xl" data-trajectory-item key={`${entry.company}-${entry.period}`}>
            <span aria-hidden="true" className="absolute -start-[calc(var(--primitive-space-lg)+0.25rem)] top-space-sm size-2 bg-accent lg:start-1/2 lg:-translate-x-1/2" />
            <div className={`grid gap-space-lg lg:col-span-1 ${index % 2 === 1 ? "lg:col-start-2" : "lg:col-start-1"}`} data-trajectory-card>
              <div className="mb-0 grid content-start gap-space-xs">
                <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent-text">{entry.period}</p>
                <p className="font-headline text-headline-md uppercase text-primary">{entry.role}</p>
                <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{entry.company}</p>
              </div>
              <Card className={index === entries.length - 1 ? "" : "mb-space-xl"}>
                <CardContent><p className="text-body-md text-on-surface-variant">{entry.detail}</p></CardContent>
              </Card>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
