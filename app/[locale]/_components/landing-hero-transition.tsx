"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

const starPoints = "50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38";
const focusStart = 0.025;
let introSeen = false;

// The same four points as the visible star, with their waist 24% of the radius.
const presentationMask = `polygon(
  50% calc(var(--portal-center) - var(--portal-size)),
  calc(50% + var(--portal-size) * 0.24) calc(var(--portal-center) - var(--portal-size) * 0.24),
  calc(50% + var(--portal-size)) var(--portal-center),
  calc(50% + var(--portal-size) * 0.24) calc(var(--portal-center) + var(--portal-size) * 0.24),
  50% calc(var(--portal-center) + var(--portal-size)),
  calc(50% - var(--portal-size) * 0.24) calc(var(--portal-center) + var(--portal-size) * 0.24),
  calc(50% - var(--portal-size)) var(--portal-center),
  calc(50% - var(--portal-size) * 0.24) calc(var(--portal-center) - var(--portal-size) * 0.24)
)`;

const burstRays = Array.from({ length: 16 }, (_, index) => {
  const angle = index * Math.PI / 8;
  const start = index % 2 ? 34 : 27;
  const end = index % 2 ? 44 : 70;
  const coordinate = (direction: number, distance: number) => (50 + direction * distance).toFixed(2);
  return {
    x1: coordinate(Math.cos(angle), start),
    y1: coordinate(Math.sin(angle), start),
    x2: coordinate(Math.cos(angle), end),
    y2: coordinate(Math.sin(angle), end),
  };
});

export function HeroStar() {
  return (
    <svg aria-hidden="true" className="block size-full fill-current" viewBox="0 0 100 100">
      <polygon points={starPoints} />
    </svg>
  );
}

export function LandingHeroTransition({ hero, presentation }: Readonly<{ hero: ReactNode; presentation: ReactNode }>) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scene = sceneRef.current;
    const heroLayer = heroRef.current;
    const star = starRef.current;
    const halo = haloRef.current;
    const burst = burstRef.current;
    const veil = veilRef.current;
    const presentationLayer = presentationRef.current;
    const frame = frameRef.current;
    const origin = heroLayer?.querySelector<HTMLElement>("[data-hero-star-origin]");
    const presentationContent = presentationLayer?.querySelector<HTMLElement>("[data-hero-presentation-content]");
    if (!scene || !heroLayer || !star || !halo || !burst || !veil || !presentationLayer || !frame || !origin || !presentationContent) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (introSeen || window.location.hash || window.scrollY > 48) return;

      const originPosition = () => {
        const source = origin.getBoundingClientRect();
        const stage = heroLayer.getBoundingClientRect();
        return { x: source.left - stage.left + source.width / 2, y: source.top - stage.top + source.height / 2 };
      };
      const viewportSpan = () => Math.max(heroLayer.clientWidth, window.innerHeight);
      const headerHeight = () => Number.parseFloat(getComputedStyle(heroLayer).top) || 0;
      const intentDistance = () => Math.min(48, window.innerHeight * 0.06);
      const apertureCenter = () => (window.innerHeight - headerHeight()) * 0.43;
      const centerX = () => (heroLayer.clientWidth - star.offsetWidth) / 2;
      const centerY = () => apertureCenter() - star.offsetHeight / 2;
      const root = document.documentElement;
      root.dataset.landingIntroActive = "true";

      gsap.set(heroLayer, { position: "sticky", top: "var(--landing-header-height)" });
      gsap.set(frame, { clipPath: presentationMask });

      const film = gsap.timeline({ paused: true, defaults: { ease: "none" } })
        .addLabel("focus", focusStart)
        .addLabel("expand", 0.23)
        .addLabel("reveal", 0.59)
        // Counter the document's movement while the portal is open. The frame and
        // the original section meet exactly when the scroll reaches the hand-off.
        .fromTo(frame, {
          y: () => intentDistance() - heroLayer.offsetHeight,
          "--portal-center": () => `${apertureCenter()}px`,
        }, { y: 0, duration: 1 }, 0)
        .to(veil, { opacity: 1, duration: 0.23, ease: "power2.out" }, "focus")
        .set(origin, { opacity: 0 }, "focus")
        .set(star, { visibility: "visible" }, "focus")
        .fromTo(star, {
          x: () => originPosition().x - star.offsetWidth / 2,
          y: () => originPosition().y - star.offsetHeight / 2,
          scale: () => origin.offsetWidth / star.offsetWidth,
        }, {
          x: centerX,
          y: centerY,
          scale: () => Math.min(heroLayer.clientWidth, window.innerHeight) * 0.36 / star.offsetWidth,
          rotation: -14,
          duration: 0.205,
          ease: "power2.out",
        }, "focus")
        .fromTo(halo, { x: centerX, y: centerY, scale: 0.9, opacity: 0 }, {
          scale: 3.4,
          keyframes: [{ opacity: 0.8, duration: 0.07 }, { opacity: 0, duration: 0.22 }],
          duration: 0.29,
          ease: "power1.out",
        }, 0.16)
        .fromTo(burst, { x: centerX, y: centerY, scale: 0.85, opacity: 0 }, {
          scale: () => viewportSpan() * 0.9 / burst.offsetWidth,
          keyframes: [{ opacity: 0.7, duration: 0.06 }, { opacity: 0, duration: 0.24 }],
          duration: 0.30,
          ease: "power2.in",
        }, "expand")
        .to(star, { scale: () => viewportSpan() * 5.4 / star.offsetWidth, rotation: 0, duration: 0.32, ease: "power2.in" }, "expand")
        .to(frame, { "--portal-size": () => `${viewportSpan() * 2.7}px`, duration: 0.41, ease: "power2.inOut" }, "reveal")
        .fromTo(presentationContent, { y: 42, scale: 0.88, opacity: 0.52 }, {
          y: 0, scale: 1, opacity: 1, duration: 0.32, ease: "power3.out", immediateRender: false,
        }, "reveal");

      let furthestProgress = 0;
      let interrupted = false;
      let releaseFrame: number | undefined;
      const release = () => {
        if (releaseFrame !== undefined) return;
        introSeen = true;
        releaseFrame = requestAnimationFrame(() => media.revert());
      };

      ScrollTrigger.create({
        trigger: scene,
        start: () => `top ${headerHeight() - intentDistance()}px`,
        endTrigger: presentationLayer,
        end: () => `top ${headerHeight()}px`,
        onRefresh: () => { if (!interrupted) film.invalidate(); },
        onUpdate: ({ progress, direction }) => {
          if (interrupted || progress <= 0 || progress >= 1) return;
          if (direction < 0 && furthestProgress >= focusStart && furthestProgress - progress > 0.02) {
            interrupted = true;
            film.revert();
            frame.style.removeProperty("clip-path");
            delete root.dataset.landingIntroActive;
            return;
          }
          if (progress > furthestProgress) {
            if (progress >= focusStart) introSeen = true;
            furthestProgress = progress;
            film.progress(progress);
          }
        },
        onLeave: release,
        onLeaveBack: () => { if (furthestProgress >= focusStart) release(); },
      });

      return () => {
        delete root.dataset.landingIntroActive;
        if (releaseFrame !== undefined) cancelAnimationFrame(releaseFrame);
      };
    });

    return () => media.revert();
  }, { scope: sceneRef });

  return (
    <div className="relative isolate" data-hero-transition ref={sceneRef}>
      <div ref={heroRef}>
        {hero}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-full min-h-svh overflow-clip">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_43%,transparent_5%,var(--primitive-color-carbon)_62%)] opacity-0" ref={veilRef} />
          <div className="absolute start-0 top-0 size-24 rounded-full border border-accent opacity-0" ref={haloRef} />
          <div className="absolute start-0 top-0 size-24 text-accent opacity-0" ref={burstRef}>
            <svg className="block size-full overflow-visible stroke-current" viewBox="0 0 100 100" fill="none" strokeWidth="0.55">
              {burstRays.map((ray, index) => <line key={index} {...ray} />)}
            </svg>
          </div>
          <div className="invisible absolute start-0 top-0 size-24 text-accent" data-hero-transition-star ref={starRef}>
            <HeroStar />
          </div>
        </div>
      </div>
      <div className="relative z-30" data-hero-transition-presentation ref={presentationRef}>
        <div className="[--portal-center:43svh] [--portal-size:0px]" data-hero-presentation-frame ref={frameRef}>{presentation}</div>
      </div>
    </div>
  );
}
