"use client";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

type Skill = {
  icon: string;
  label: string;
  score: number;
};

type SkillGroup = {
  description: string;
  index: string;
  label: string;
  skills: readonly Skill[];
  stack: string;
};

const skillGroups: readonly SkillGroup[] = [
  {
    description: "Interfaces modernas, accesibles y mantenibles con foco en composición, tipado y sistemas visuales consistentes.",
    index: "01",
    label: "Frontend",
    skills: [
      { icon: "⚛️", label: "React", score: 90 },
      { icon: "🚀", label: "Astro", score: 85 },
      { icon: "🔷", label: "TypeScript", score: 95 },
      { icon: "▲", label: "Next.js", score: 80 },
      { icon: "🌊", label: "Tailwind", score: 95 },
      { icon: "🅰️", label: "Angular", score: 85 },
      { icon: "📖", label: "Storybook", score: 80 },
    ],
    stack: "REACT / ANGULAR / SYSTEMS",
  },
  {
    description: "Servicios con contratos claros, persistencia fiable y estructuras de backend pensadas para evolucionar sin ruido.",
    index: "02",
    label: "Backend",
    skills: [
      { icon: "💚", label: "Node.js", score: 90 },
      { icon: "🐍", label: "Python", score: 85 },
      { icon: "🐘", label: "PostgreSQL", score: 80 },
      { icon: "◈", label: "GraphQL", score: 75 },
      { icon: "☕", label: "Spring Boot", score: 80 },
      { icon: "◉", label: "NestJS", score: 85 },
    ],
    stack: "NODE / PYTHON / JAVA",
  },
  {
    description: "Infraestructura reproducible, entregas automatizadas y operaciones observables para sostener productos en producción.",
    index: "03",
    label: "DevTools",
    skills: [
      { icon: "🐳", label: "Docker", score: 90 },
      { icon: "☁️", label: "AWS", score: 85 },
      { icon: "▲", label: "Vercel", score: 95 },
      { icon: "🔄", label: "CI/CD", score: 90 },
    ],
    stack: "DOCKER / AWS / DELIVERY",
  },
  {
    description: "IA aplicada a flujos reales: conectar herramientas, reducir trabajo repetitivo y mantener el control sobre cada decisión.",
    index: "04",
    label: "IA y automatizaciones",
    skills: [
      { icon: "🤖", label: "OpenAI", score: 95 },
      { icon: "⛓️", label: "LangChain", score: 85 },
      { icon: "📎", label: "RAG", score: 80 },
      { icon: "⚡", label: "n8n", score: 90 },
    ],
    stack: "OPENAI / MCP / WORKFLOWS",
  },
];

function SkillGroupCard({ group, isVisible, setSkillGroup }: Readonly<{ group: SkillGroup; isVisible: boolean; setSkillGroup: (element: HTMLElement | null, index: string) => void }>) {
  return (
    <article className="border border-border bg-surface-container p-space-lg" data-skill-group={group.index} ref={(element) => setSkillGroup(element, group.index)}>
      <div className="flex flex-wrap items-start justify-between gap-space-md border-b border-border pb-space-md">
        <div>
          <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{group.index} / {group.stack}</p>
          <h3 className="mt-space-sm font-headline text-headline-lg uppercase text-primary">{group.label}</h3>
        </div>
        <span aria-hidden="true" className="font-headline text-headline-xl text-accent">✦</span>
      </div>
      <p className="mt-space-lg text-body-md text-on-surface-variant">{group.description}</p>
      <div className="mt-space-xl grid gap-space-md">
        {group.skills.map((skill) => {
          return (
            <div className="grid gap-space-xs" key={skill.label}>
              <div className="flex items-center justify-between gap-space-md font-mono text-mono-code uppercase text-on-surface-variant">
                <span className="flex min-w-0 items-center gap-space-sm"><span aria-hidden="true" className="text-base normal-case">{skill.icon}</span><span>{skill.label}</span></span>
                <span className="shrink-0 text-accent">{skill.score}%</span>
              </div>
              <div aria-label={`${skill.label}: ${skill.score}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={isVisible ? skill.score : 0} className="h-2 border border-border bg-surface-lowest p-px" role="progressbar">
                <span className="block h-full origin-left bg-primary" data-score={skill.score} style={{ width: "0%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function LandingCapabilities() {
  const scope = useRef<HTMLDivElement>(null);
  const skillGroupsRef = useRef<Array<HTMLElement | null>>([]);
  const [visibleGroups, setVisibleGroups] = useState<ReadonlySet<string>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = scope.current;
    if (!root) {
      return;
    }

    const groups = skillGroupsRef.current.filter((group): group is HTMLElement => group !== null);
    const getBars = (group: HTMLElement) => Array.from(group.querySelectorAll<HTMLSpanElement>("[data-score]"));
    const resetGroup = (group: HTMLElement) => {
      const bars = getBars(group);
      gsap.killTweensOf(bars);
      gsap.set(bars, { width: "0%" });
    };
    const fillGroup = (group: HTMLElement) => {
      const bars = getBars(group);
      if (prefersReducedMotion) {
        gsap.set(bars, { width: (index, target) => `${target.dataset.score ?? 0}%` });
        return;
      }

      gsap.fromTo(
        bars,
        { width: "0%" },
        {
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.045,
          width: (index, target) => `${target.dataset.score ?? 0}%`,
        },
      );
    };

    groups.forEach(resetGroup);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        const group = entry.target as HTMLElement;
        const groupIndex = group.dataset.skillGroup;
        if (!groupIndex) return;

        setVisibleGroups((current) => {
          const next = new Set(current);
          if (entry.isIntersecting) {
            next.add(groupIndex);
            fillGroup(group);
          } else {
            next.delete(groupIndex);
            resetGroup(group);
          }
          return next;
        });
      }),
      { threshold: 0.2 },
    );

    groups.forEach((group) => observer.observe(group));
    return () => {
      observer.disconnect();
      groups.forEach((group) => gsap.killTweensOf(getBars(group)));
    };
  }, [prefersReducedMotion]);

  const setSkillGroup = (element: HTMLElement | null, index: string) => {
    skillGroupsRef.current[Number(index) - 1] = element;
  };

  return (
    <div className="grid gap-space-lg md:grid-cols-2" ref={scope}>
      {skillGroups.map((group) => <SkillGroupCard group={group} isVisible={visibleGroups.has(group.index)} key={group.index} setSkillGroup={setSkillGroup} />)}
    </div>
  );
}
