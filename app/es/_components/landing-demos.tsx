"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Card } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";
import { demoRouteList, type PortfolioRoute } from "@/app/es/route-map";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type DemoProfile = {
  description: string;
  file: string;
  input: string;
  output: readonly string[];
  stack: string;
  telemetry: readonly [string, string, string];
};

const demoProfiles: readonly DemoProfile[] = [
  {
    description: "Motor orquestador que provisiona agentes conversacionales con memoria vectorial episódica, tool-calling determinista y validación estricta de esquemas en milisegundos.",
    file: "AGENT_NODE_RUNNER.PY",
    input: "Configurar agente de soporte Nivel 2",
    output: [
      "Vector store initialized at namespace: tenant_9021",
      "Tools registered: [sql_query, stripe_refund, slack_dispatch]",
      "System prompt compiled (tokens: 412, safety_guard: ON)",
    ],
    stack: "LLM / LANGCHAIN / POSTGRES",
    telemetry: ["142ms", "99.4%", "PGVECTOR / 1536 DIM"],
  },
  {
    description: "Flujo visual para ordenar leads, asignar responsables y conservar una traza operativa que el equipo comercial puede revisar sin perder contexto.",
    file: "LEAD_FLOW_RUNTIME.TS",
    input: "Mover lead ACME a etapa cualificada",
    output: [
      "Owner resolved: Marta / sales_ops",
      "Stage transition persisted: contacted → qualified",
      "Audit event appended: lead_transition_024",
    ],
    stack: "NODE / POSTGRES / WORKFLOWS",
    telemetry: ["86ms", "4 ETAPAS", "AUDIT TRAIL / ON"],
  },
  {
    description: "Mesa de cualificación con criterios explicables, filtros por segmento y una capa de IA que prioriza oportunidades sin ocultar el motivo de cada decisión.",
    file: "QUALIFICATION_DESK.PY",
    input: "Evaluar encaje de lead enterprise",
    output: [
      "Segment detected: enterprise / regulated",
      "Fit score calculated: 87 / 100",
      "Recommendation emitted: human_review",
    ],
    stack: "OPENAI / RAG / ZOD",
    telemetry: ["212ms", "87 / 100", "EXPLAINABLE / ON"],
  },
  {
    description: "Canal de pedidos con eventos deterministas, estados visibles y una interfaz preparada para que cada cambio de operación tenga una respuesta clara.",
    file: "ORDER_STREAM.RUNTIME",
    input: "Emitir evento: pedido preparado",
    output: [
      "Event accepted: order_ready",
      "Subscribers notified: 3 / 3",
      "Projection updated: delivery_queue",
    ],
    stack: "NEXT.JS / WEBSOCKETS / POSTGRES",
    telemetry: ["118ms", "3 / 3", "EVENT STREAM / LIVE"],
  },
  {
    description: "Sala de control para leer métricas, filtrar operaciones y convertir decisiones de negocio en acciones pequeñas, trazables y reversibles.",
    file: "OPERATIONS_CONSOLE.TSX",
    input: "Revisar incidencia #OP-204",
    output: [
      "Period loaded: last_30_days",
      "Status filter applied: open",
      "Review action prepared: local_mock",
    ],
    stack: "REACT / TYPESCRIPT / DATA",
    telemetry: ["64ms", "30 DÍAS", "LOCAL / MOCK"],
  },
];

type DemoCardProps = {
  index: number;
  profile: DemoProfile;
  route: PortfolioRoute;
  isActive: boolean;
};

function DemoCard({ index, isActive, profile, route }: DemoCardProps) {
  return (
    <Card
      aria-hidden={!isActive}
      className={`absolute inset-0 flex w-full flex-col justify-between bg-surface-container p-space-md md:p-space-xl ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
      data-demo-panel
      data-demo-panel-index={index}
      inert={!isActive ? true : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-border pb-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="bg-accent px-space-sm py-space-xs font-mono text-mono-code font-bold text-background">{`{ ${String(index + 1).padStart(2, "0")} }`}</span>
          <span className="font-headline text-headline-md uppercase text-primary">{route.title}</span>
        </div>
        <span className="font-mono text-mono-code uppercase text-accent">✦ STACK: {profile.stack}</span>
      </div>

      <div className="grid gap-space-xl py-space-lg lg:grid-cols-12 lg:items-center">
        <div className="grid gap-space-lg lg:col-span-5">
          <p className="text-body-md text-secondary">{profile.description}</p>
          <div className="grid gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
            <div className="flex justify-between border-b border-border py-space-sm"><span>RUNTIME_LATENCY</span><strong className="text-primary">{profile.telemetry[0]}</strong></div>
            <div className="flex justify-between border-b border-border py-space-sm"><span>OPERATING_SIGNAL</span><strong className="text-primary">{profile.telemetry[1]}</strong></div>
            <div className="flex justify-between border-b border-border py-space-sm"><span>DATA_LAYER</span><strong className="text-primary">{profile.telemetry[2]}</strong></div>
          </div>
          <Link className="inline-flex min-h-12 w-fit items-center gap-space-sm border border-primary bg-primary px-space-md font-headline text-label-caps uppercase text-primary-foreground transition-colors hover:border-accent hover:bg-background hover:text-primary active:scale-[0.98]" href={route.href} tabIndex={isActive ? 0 : -1}>
            <span aria-hidden="true" className="text-accent">✦</span>
            Iniciar demo interactiva
            <span className="font-mono text-mono-code">[ EXEC ]</span>
          </Link>
        </div>

        <div className="bg-surface-container-lowest p-space-md lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border pb-space-sm font-mono text-[0.6875rem] text-on-surface-variant">
            <span className="text-primary">{profile.file}</span>
            <span>PORT: 8080 // SECURE</span>
          </div>
          <div className="grid gap-space-sm pt-space-md font-mono text-mono-code">
            <div className="flex items-center justify-between gap-space-sm bg-surface-container p-space-sm text-on-surface-variant">
              <span className="truncate">[IN] PROMPT: &quot;{profile.input}&quot;</span>
              <span className="text-accent">OK</span>
            </div>
            <div className="bg-surface-container-low p-space-md text-secondary">
              <p className="mb-space-sm text-accent">{`{ ✦ KERNEL DEPLOYMENT SEQUENCE }`}</p>
              <p className="text-mono-code leading-relaxed text-on-surface">
                {profile.output.map((line) => <span className="block" key={line}>&gt; {line}</span>)}
              </p>
            </div>
            <div className="grid grid-cols-3 items-center gap-space-sm py-space-md text-center text-[0.6875rem] uppercase text-on-surface-variant">
              <span className="border border-border p-space-sm">INPUT</span>
              <span className="border border-accent p-space-sm text-accent">KERNEL</span>
              <span className="border border-border p-space-sm">OUTPUT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-sm border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant sm:grid-cols-5">
        {demoRouteList.map((demo, demoIndex) => (
          <span className={demoIndex === index ? "bg-surface-high px-space-sm py-space-xs text-accent" : "px-space-sm py-space-xs"} key={demo.href}>
            {`{ ${String(demoIndex + 1).padStart(2, "0")} }`} {demo.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function LandingDemos() {
  const scope = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = scope.current;
      const scene = root?.querySelector<HTMLElement>("[data-demo-scene]");
      const panels = Array.from(root?.querySelectorAll<HTMLElement>("[data-demo-panel]") ?? []);

      if (!scene || panels.length < 2) {
        return;
      }

      const updateActiveIndex = (nextIndex: number) => {
        if (activeIndexRef.current === nextIndex) {
          return;
        }

        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      };

      const scrollDistance = () => Math.max(1, panels.length - 1) * Math.max(180, Math.min(260, window.innerHeight * 0.24));
      const getPanelIndex = (progress: number) => Math.min(panels.length - 1, Math.round(progress * (panels.length - 1)));

      if (prefersReducedMotion) {
        gsap.set(panels, { clearProps: "opacity,visibility,transform" });

        const reducedMotionTrigger = ScrollTrigger.create({
          end: () => `+=${scrollDistance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateActiveIndex(getPanelIndex(self.progress)),
          start: "top top+=80",
          trigger: scene,
        });

        return () => reducedMotionTrigger.kill();
      }

      gsap.set(panels, { autoAlpha: 0, y: 22 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          anticipatePin: 1,
          end: () => `+=${scrollDistance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateActiveIndex(getPanelIndex(self.progress)),
          scrub: 0.65,
          start: "top top+=80",
          trigger: scene,
        },
      });

      panels.slice(1).forEach((panel, index) => {
        const previousPanel = panels[index];
        timeline
          .to(previousPanel, { autoAlpha: 0, duration: 0.42, ease: "power2.in", y: -16 })
          .to(panel, { autoAlpha: 1, duration: 0.58, ease: "power3.out", y: 0 }, "<0.16");
      });

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { dependencies: [prefersReducedMotion], revertOnUpdate: true, scope },
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl" ref={scope}>
      <div className="relative" data-demo-scene style={{ minHeight: "calc(100svh - 6rem + 4 * max(180px, min(260px, 24svh)))" }}>
        <div className="sticky top-20 z-10 flex min-h-[calc(100svh-8rem)] items-center py-space-lg" data-demo-pin>
          <div className="relative min-h-[min(43rem,calc(100svh-10rem))] w-full" data-demo-stage>
            {demoRouteList.map((route, index) => (
              <DemoCard index={index} isActive={activeIndex === index} profile={demoProfiles[index]} route={route} key={route.href} />
            ))}
            <div aria-label="Progreso de demos" className="absolute -bottom-space-lg start-0 z-20 flex gap-space-xs" role="tablist">
              {demoRouteList.map((route, index) => (
                <span aria-label={`${route.title}, paso ${index + 1} de ${demoRouteList.length}`} aria-selected={activeIndex === index} className={`h-1 transition-[width,background-color] duration-200 ${activeIndex === index ? "w-10 bg-accent" : "w-3 bg-surface-highest"}`} key={route.href} role="tab" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
