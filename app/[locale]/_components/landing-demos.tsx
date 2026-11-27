"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getDemoPanelIndex, getDemoSegmentDistance } from "@/app/[locale]/_components/demo-scroll";
import { Card } from "@/app/components/ui";
import { usePrefersReducedMotion } from "@/app/[locale]/_components/use-prefers-reduced-motion";
import { demoRouteList, type PortfolioRoute } from "@/app/[locale]/route-map";
import styles from "./landing-demos.module.css";

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
  const locale = useLocale();
  const t = usePublicCopy();
  return (
    <Card
      aria-hidden={!isActive}
      className={`min-w-0 bg-surface-container p-space-md [overflow-wrap:anywhere] md:p-space-xl ${isActive ? "" : "hidden"}`}
      data-demo-panel
      data-demo-panel-index={index}
    >
      <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-border pb-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="shrink-0 whitespace-nowrap bg-accent px-space-sm py-space-xs font-mono text-mono-code font-bold text-background">{`{ ${String(index + 1).padStart(2, "0")} }`}</span>
          <span className="font-headline text-headline-md uppercase text-primary">{t(route.title)}</span>
        </div>
        <span className="font-mono text-mono-code uppercase text-accent">✦ STACK: {profile.stack}</span>
      </div>

      <div className="grid grid-cols-1 gap-space-xl py-space-lg lg:grid-cols-12 lg:items-center">
        <div className="grid min-w-0 gap-space-lg lg:col-span-5">
          <p className="text-body-md text-secondary">{t(profile.description)}</p>
          <Link className="inline-flex min-h-12 w-fit items-center gap-space-sm border border-primary bg-primary px-space-md font-headline text-label-caps uppercase text-primary-foreground transition-colors hover:border-accent hover:bg-background hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={localePath(route.href, locale)} tabIndex={isActive ? 0 : -1}>
            {t("Abrir demo")}
          </Link>
          <div className="grid gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
            <div className="flex justify-between gap-space-xs border-b border-border py-space-sm"><span>RUNTIME_LATENCY</span><strong className="text-end text-primary">{profile.telemetry[0]}</strong></div>
            <div className="flex justify-between gap-space-xs border-b border-border py-space-sm"><span>OPERATING_SIGNAL</span><strong className="text-end text-primary">{t(profile.telemetry[1])}</strong></div>
            <div className="flex justify-between gap-space-xs border-b border-border py-space-sm"><span>DATA_LAYER</span><strong className="text-end text-primary">{profile.telemetry[2]}</strong></div>
          </div>
        </div>

        <div className="min-w-0 bg-surface-container-lowest p-space-md lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-space-xs border-b border-border pb-space-sm font-mono text-[0.6875rem] text-on-surface-variant">
            <span className="text-primary">{profile.file}</span>
            <span>PORT: 8080 // SECURE</span>
          </div>
          <div className="grid grid-cols-1 gap-space-sm pt-space-md font-mono text-mono-code">
            <div className="flex items-center justify-between gap-space-sm bg-surface-container p-space-sm text-on-surface-variant">
              <span className="min-w-0 truncate">[IN] PROMPT: &quot;{t(profile.input)}&quot;</span>
              <span className="shrink-0 text-accent">OK</span>
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

      <div className={`${styles.progress} flex-wrap gap-space-sm border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant`}>
        {demoRouteList.map((demo, demoIndex) => (
          <span className={demoIndex === index ? "bg-surface-high px-space-sm py-space-xs text-accent" : "px-space-sm py-space-xs"} key={demo.href}>
            {`{ ${String(demoIndex + 1).padStart(2, "0")} }`} {t(demo.label)}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function LandingDemos() {
  const t = usePublicCopy();
  const scope = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  function selectDemo(index: number) {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }

  useGSAP(
    () => {
      const root = scope.current;
      const scene = root?.querySelector<HTMLElement>("[data-demo-scene]");
      const panels = Array.from(root?.querySelectorAll<HTMLElement>("[data-demo-panel]") ?? []);

      if (!scene || panels.length < 2) {
        return;
      }

      const media = gsap.matchMedia();
      media.add("(min-width: 64rem) and (min-height: 48rem)", () => {
        const trigger = ScrollTrigger.create({
          end: () => `+=${panels.length * getDemoSegmentDistance(window.innerHeight)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextIndex = getDemoPanelIndex(self.progress, panels.length);
            if (activeIndexRef.current === nextIndex) return;
            selectDemo(nextIndex);
            if (!prefersReducedMotion) {
              gsap.killTweensOf(panels);
              gsap.fromTo(panels[nextIndex], { opacity: 0 }, { opacity: 1, duration: 0.24, clearProps: "opacity" });
            }
          },
          start: "top top+=80",
          trigger: scene,
        });
        selectDemo(getDemoPanelIndex(trigger.progress, panels.length));
        return () => {
          trigger.kill();
          gsap.killTweensOf(panels);
          gsap.set(panels, { clearProps: "opacity" });
        };
      });
      return () => media.revert();
    },
    { dependencies: [prefersReducedMotion], revertOnUpdate: true, scope },
  );

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-6xl" ref={scope}>
      <div className={styles.scene} data-demo-scene style={{ "--demo-count": demoRouteList.length } as CSSProperties}>
        <div className={styles.pin} data-demo-pin>
          <div className="grid w-full min-w-0 gap-space-sm" data-demo-stage>
            <div aria-label={t("Progreso de demos")} className={`${styles.controls} flex flex-wrap gap-space-xs`} role="group">
              {demoRouteList.map((route, index) => (
                <button aria-pressed={activeIndex === index} className="min-h-11 border border-border px-space-sm py-space-xs text-start font-mono text-mono-code text-primary aria-pressed:border-accent aria-pressed:text-accent-text" key={route.href} onClick={() => selectDemo(index)} type="button">
                  {t(route.label)}
                </button>
              ))}
            </div>
            {demoRouteList.map((route, index) => (
              <DemoCard index={index} isActive={activeIndex === index} profile={demoProfiles[index]} route={route} key={route.href} />
            ))}
            <div aria-hidden="true" className={`${styles.progress} gap-space-xs`}>
              {demoRouteList.map((route, index) => (
                <span className={`h-1 motion-safe:transition-[width,background-color] motion-safe:duration-200 ${activeIndex === index ? "w-10 bg-accent" : "w-3 bg-surface-highest"}`} key={route.href} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
