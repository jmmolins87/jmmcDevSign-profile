"use client";

import { useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

type LandingScrollProps = Readonly<{
  children: React.ReactNode;
}>;

export function LandingScroll({ children }: LandingScrollProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let removeScrollListener: (() => void) | null = null;
    let raf: ((time: number) => void) | null = null;

    const destroyLenis = () => {
      if (!lenis) {
        return;
      }

      removeScrollListener?.();
      if (raf) {
        gsap.ticker.remove(raf);
      }
      lenis.destroy();
      lenis = null;
      removeScrollListener = null;
      raf = null;
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.refresh();
      delete document.documentElement.dataset.landingScroll;
    };

    const createLenis = () => {
      if (reducedMotionQuery.matches || lenis) {
        return;
      }

      lenis = new Lenis({
        anchors: true,
        autoRaf: false,
        respectReducedMotion: false,
        stopInertiaOnNavigate: true,
      });
      removeScrollListener = lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis?.raf(time * 1000);

      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
      document.documentElement.dataset.landingScroll = "lenis";
    };

    const handleMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches) {
        destroyLenis();
        return;
      }

      createLenis();
    };

    createLenis();
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      reducedMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
      destroyLenis();
    };
  }, []);

  return children;
}
