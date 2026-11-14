"use client";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Card, CardContent, CardHeader, CardMeta, CardTitle } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type LandingService = {
  description: string;
  index: string;
  title: string;
};

export function LandingServices({ services }: Readonly<{ services: readonly LandingService[] }>) {
  const scope = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = scope.current;
      const cards = Array.from(root?.querySelectorAll<HTMLElement>("[data-service-card]") ?? []);

      if (!root || cards.length === 0) {
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 28 });
      const batchTriggers = ScrollTrigger.batch(cards, {
        batchMax: 4,
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
    <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-4" ref={scope}>
      {services.map((service) => (
        <Card className="group flex min-h-[22rem] flex-col transition-colors hover:border-accent" data-service-card key={service.index}>
          <CardHeader className="border-b-0 pb-space-md">
            <div className="grid gap-space-xs">
              <CardMeta>{`SERVICE / ${service.index}`}</CardMeta>
              <span className="font-mono text-mono-code uppercase tracking-[0.08em] text-accent">{`{ 0${Number(service.index)} }`}</span>
            </div>
            <span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant transition-colors group-hover:text-accent">✦</span>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between gap-space-xl pt-0">
            <div className="grid gap-space-sm">
              <CardTitle className="text-headline-lg leading-tight">{service.title}</CardTitle>
              <p className="text-body-md text-on-surface-variant">{service.description}</p>
            </div>
            <div className="border-t border-border pt-space-md font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">
              <span className="text-accent">✦</span> Alcance / estrategia + ejecución
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
