"use client";

import { useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";
import { LandingWarpControl } from "@/app/es/_components/landing-warp-control";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

type LandingHeroMotionProps = Readonly<{
  children: React.ReactNode;
}>;

type WarpPlaybackState = "playing" | "paused";

export function LandingHeroMotion({ children }: LandingHeroMotionProps) {
  const scope = useRef<HTMLDivElement>(null);
  const warpTimeline = useRef<gsap.core.Timeline | null>(null);
  const warpPlaybackRef = useRef<WarpPlaybackState>("playing");
  const [warpPlayback, setWarpPlayback] = useState<WarpPlaybackState>("playing");
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    (_, contextSafe) => {
      const root = scope.current;

      if (!root) {
        return;
      }

      const select = <T extends Element>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
      const metadata = select<HTMLElement>('[data-hero-element="metadata"]');
      const warpLayers = select<SVGElement>("[data-hero-layer]");
      const eyebrow = select<HTMLElement>('[data-hero-element="eyebrow"]');
      const brackets = select<HTMLElement>('[data-hero-element^="bracket-"]');
      const monogram = select<HTMLElement>('[data-hero-element^="monogram-"]');
      const star = select<HTMLElement>('[data-hero-element="star"]');
      const description = select<HTMLElement>('[data-hero-element="description"]');
      const cta = select<HTMLElement>('[data-hero-element="cta"]');
      const rail = select<HTMLElement>('[data-hero-element="rail"]');
      const entryTargets = [...metadata, ...eyebrow, ...brackets, ...monogram, ...star, ...description, ...cta, ...rail];
      const radialLines = select<SVGElement>('[data-hero-layer="radial-lines"]');
      const constellation = select<SVGElement>('[data-hero-layer="constellation"]');
      const constellationNodes = select<SVGCircleElement>('[data-hero-layer="constellation-nodes"] circle');
      const glow = select<SVGElement>('[data-hero-layer="glow"]');
      const guides = select<SVGElement>('[data-hero-layer="guides"]');
      const media = gsap.matchMedia();
      const parallaxMedia = gsap.matchMedia();
      const hero = root.parentElement;

      media.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
        const reduceMotion = Boolean(context.conditions?.reduceMotion);

        if (reduceMotion) {
          warpTimeline.current = null;
          gsap.set(entryTargets, { autoAlpha: 0, clearProps: "transform" });
          gsap.set(warpLayers, { autoAlpha: 1 });
          gsap.to(entryTargets, { autoAlpha: 1, duration: 0.2, ease: "power1.out", stagger: 0.02 });
          return;
        }

        gsap.set(metadata, { autoAlpha: 0, y: -12 });
        gsap.set(warpLayers, { autoAlpha: 0 });
        gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
        gsap.set(brackets, { autoAlpha: 0, scale: 0.94, y: 14 });
        gsap.set(monogram, { autoAlpha: 0, scale: 0.88, y: 28 });
        gsap.set(star, { autoAlpha: 0, scale: 0, rotation: -32 });
        gsap.set(description, { autoAlpha: 0, y: 18 });
        gsap.set(cta, { autoAlpha: 0, y: 22 });
        gsap.set(rail, { autoAlpha: 0, y: 12 });

        warpTimeline.current = gsap
          .timeline({ paused: true })
          .to(radialLines, { duration: 42, ease: "none", repeat: -1, rotation: 360, transformOrigin: "50% 50%" }, 0)
          .to(guides, { duration: 68, ease: "none", repeat: -1, rotation: -360, transformOrigin: "50% 50%" }, 0)
          .to(constellation, { duration: 6, ease: "sine.inOut", repeat: -1, rotation: 2, x: 18, y: -10, yoyo: true }, 0)
          .to(glow, { duration: 3.4, ease: "sine.inOut", repeat: -1, scale: 1.12, transformOrigin: "50% 50%", yoyo: true }, 0)
          .to(constellationNodes, { duration: 1.35, ease: "sine.inOut", repeat: -1, scale: 1.3, stagger: { each: 0.16, from: "random" }, transformOrigin: "center center", yoyo: true }, 0)
          .play();

        if (warpPlaybackRef.current === "paused") {
          warpTimeline.current.pause();
        }

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .to(metadata, { autoAlpha: 1, duration: 0.55, y: 0 }, 0)
          .to(warpLayers, { autoAlpha: 1, duration: 0.8, stagger: 0.06 }, 0.08)
          .to(eyebrow, { autoAlpha: 1, duration: 0.55, y: 0 }, 0.26)
          .to(brackets, { autoAlpha: 1, duration: 0.75, scale: 1, stagger: 0.08, y: 0 }, 0.38)
          .to(monogram, { autoAlpha: 1, duration: 0.72, scale: 1, stagger: 0.1, y: 0 }, 0.55)
          .to(star, { autoAlpha: 1, duration: 0.68, ease: "back.out(1.8)", rotation: 0, scale: 1 }, 0.82)
          .to(description, { autoAlpha: 1, duration: 0.58, y: 0 }, 1.08)
          .to(cta, { autoAlpha: 1, duration: 0.58, y: 0 }, 1.22)
          .to(rail, { autoAlpha: 1, duration: 0.5, y: 0 }, 1.42);
      });

      if (hero) {
        gsap.registerPlugin(ScrollTrigger);

        parallaxMedia.add(
          {
            hasPrecisePointer: "(hover: hover) and (pointer: fine)",
            isDesktop: "(min-width: 64rem)",
            reduceMotion: "(prefers-reduced-motion: reduce)",
          },
          (context) => {
            const { hasPrecisePointer, isDesktop, reduceMotion } = context.conditions ?? {};

            if (reduceMotion) {
              return;
            }

            const scrollLayers = select<SVGElement>('[data-hero-parallax="scroll"]');
            const pointerLayers = select<SVGElement>('[data-hero-parallax="pointer"]');

            gsap.to(scrollLayers, {
              ease: "none",
              scrollTrigger: {
                end: "bottom top",
                invalidateOnRefresh: true,
                scrub: 0.8,
                start: "top top",
                trigger: hero,
              },
              y: () => (window.innerWidth < 768 ? -window.innerHeight * 0.05 : -window.innerHeight * 0.12),
            });

            const safeContext = contextSafe;

            if (!isDesktop || !hasPrecisePointer || !safeContext) {
              return;
            }

            const stage = select<HTMLElement>('[data-hero-element="stage"]');
            const handlePointerMove = safeContext((event: PointerEvent) => {
              const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2;
              const normalizedY = (event.clientY / window.innerHeight - 0.5) * 2;

              gsap.to(stage, { duration: 0.8, ease: "power3.out", overwrite: "auto", x: normalizedX * 16, y: normalizedY * 10 });
              gsap.to(pointerLayers, { duration: 1.1, ease: "power2.out", overwrite: "auto", x: normalizedX * 8, y: normalizedY * 6 });
            });
            const resetPointer = safeContext(() => {
              gsap.to(stage, { duration: 0.9, ease: "power3.out", overwrite: "auto", x: 0, y: 0 });
              gsap.to(pointerLayers, { duration: 1.1, ease: "power2.out", overwrite: "auto", x: 0, y: 0 });
            });

            hero.addEventListener("pointermove", handlePointerMove);
            hero.addEventListener("pointerleave", resetPointer);

            return () => {
              hero.removeEventListener("pointermove", handlePointerMove);
              hero.removeEventListener("pointerleave", resetPointer);
              resetPointer();
            };
          },
        );
      }

      return () => {
        warpTimeline.current = null;
        parallaxMedia.revert();
        media.revert();
      };
    },
    { scope },
  );

  const toggleWarp = () => {
    if (prefersReducedMotion) {
      return;
    }

    setWarpPlayback((current) => {
      const next = current === "playing" ? "paused" : "playing";
      const timeline = warpTimeline.current;

      warpPlaybackRef.current = next;
      if (timeline) {
        if (next === "playing") {
          timeline.play();
        } else {
          timeline.pause();
        }
      }

      return next;
    });
  };

  return (
    <div className="contents" data-hero-motion-root ref={scope}>
      {children}
      <LandingWarpControl
        isDisabled={prefersReducedMotion === true}
        isPlaying={!prefersReducedMotion && warpPlayback === "playing"}
        onToggle={toggleWarp}
      />
    </div>
  );
}
