import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/app/es/_components/contact-form";
import { LandingHeroMotion } from "@/app/es/_components/landing-hero-motion";
import { LandingMotionLink } from "@/app/es/_components/landing-motion-link";
import { LandingUtcClock } from "@/app/es/_components/landing-utc-clock";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  EditorialList,
} from "@/app/components/ui";
import { demoRouteList } from "@/app/es/route-map";

type LandingSectionId =
  | "presentacion"
  | "demos"
  | "skills"
  | "trayectoria"
  | "blog"
  | "contacto";

type LandingSection = {
  id: LandingSectionId;
  index: string;
  eyebrow: string;
  title: string;
};

type LandingPost = {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  href: string;
};

type Capability = {
  index: string;
  title: string;
  stack: string;
  description: string;
  score: number;
  metric: string;
};

type TimelineEntry = {
  period: string;
  role: string;
  company: string;
  detail: string;
};

const landingSections = {
  presentacion: {
    id: "presentacion",
    index: "01",
    eyebrow: "Dossier / manifiesto",
    title: "Presentación",
  },
  demos: {
    id: "demos",
    index: "02",
    eyebrow: "Experimentos / producto",
    title: "Demos interactivas",
  },
  skills: {
    id: "skills",
    index: "03",
    eyebrow: "Matriz / sistemas",
    title: "Capacidades técnicas",
  },
  trayectoria: {
    id: "trayectoria",
    index: "04",
    eyebrow: "Registro / trayectoria",
    title: "Trayectoria",
  },
  blog: {
    id: "blog",
    index: "05",
    eyebrow: "Archivo / publicaciones",
    title: "Publicaciones técnicas",
  },
  contacto: {
    id: "contacto",
    index: "06",
    eyebrow: "Canal / contacto directo",
    title: "Construyamos algo que perdure",
  },
} satisfies Record<LandingSectionId, LandingSection>;

const capabilities: readonly Capability[] = [
  {
    index: "01",
    title: "Frontend architecture",
    stack: "React / Next.js / TypeScript",
    description: "Interfaces composables, rápidas y preparadas para crecer sin deuda estructural.",
    score: 98,
    metric: "SIN DESPLAZAMIENTO",
  },
  {
    index: "02",
    title: "Backend y datos distribuidos",
    stack: "Node / PostgreSQL / Redis",
    description: "Contratos claros, persistencia desacoplada y operaciones observables desde el primer día.",
    score: 94,
    metric: "RIGOR SISTÉMICO",
  },
  {
    index: "03",
    title: "Automatización y agentes",
    stack: "LLM / tools / workflows",
    description: "Flujos deterministas para que la automatización sea útil, auditable y reversible.",
    score: 91,
    metric: "EJECUCIÓN AUDITABLE",
  },
  {
    index: "04",
    title: "Sistemas de diseño",
    stack: "Tokens / UI / dirección",
    description: "Lenguajes visuales que convierten decisiones de diseño en piezas mantenibles.",
    score: 96,
    metric: "SIN RELLENO",
  },
];

const timeline: readonly TimelineEntry[] = [
  {
    period: "PRESENTE",
    role: "Arquitecto y fundador",
    company: "JMMC Devsign / Systems Lab",
    detail: "Diseño y construcción de productos digitales con frontend, backend, datos y criterio editorial en el mismo sistema.",
  },
  {
    period: "2022 — 2024",
    role: "Ingeniero fullstack principal",
    company: "Grupo tecnológico Scale",
    detail: "Plataformas enterprise, Next.js, PostgreSQL distribuido y automatización de operaciones críticas.",
  },
  {
    period: "2019 — 2022",
    role: "Diseñador senior de producto",
    company: "Estudio de vanguardia",
    detail: "Sistemas de diseño, prototipos interactivos y dirección visual para interfaces con personalidad propia.",
  },
];

const posts: readonly LandingPost[] = [
  {
    id: "modular-monolith",
    title: "El ocaso de los microservicios caóticos: volviendo al monolito modular",
    category: "Arquitectura distribuida",
    readingTime: "14 MIN",
    href: "/es/blog/editor",
  },
  {
    id: "agent-runtime",
    title: "Agentes que ejecutan: de la instrucción a la ejecución",
    category: "Agentes de IA",
    readingTime: "08 MIN",
    href: "/es/blog/editor",
  },
  {
    id: "design-contracts",
    title: "El contrato visual también es arquitectura",
    category: "Sistemas de diseño",
    readingTime: "05 MIN",
    href: "/es/blog/editor",
  },
];

function SectionHeader({
  action,
  section,
  aside,
}: Readonly<{
  action?: React.ReactNode;
  aside?: string;
  section: LandingSection;
}>) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">
      <div>
        <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-accent-text">
          {`[ SECTION // ${section.index} ]`} {section.eyebrow}
        </p>
        <h2 className="mt-space-sm max-w-4xl font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id={`${section.id}-title`}>
          {section.title}
        </h2>
      </div>
      {action ?? (
        <span className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">
          {aside ?? "{ REGISTRO / ACTIVO }"}
        </span>
      )}
    </header>
  );
}

function HeroWarp() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-clip opacity-80" data-hero-warp>
      <svg className="absolute inset-0 h-full w-full" data-hero-layer="radial-lines" data-hero-parallax="scroll" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs>
          <linearGradient id="hero-warp-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#EFEBE3" stopOpacity="0.08" />
            <stop offset="62%" stopColor="#FF5A1F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="hero-warp-glow">
            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#FF5A1F" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g data-hero-layer="glow" data-hero-parallax="pointer">
          <circle cx="720" cy="450" fill="url(#hero-warp-glow)" r="260" />
        </g>
        <g data-hero-layer="rays" stroke="url(#hero-warp-gradient)">
          <line opacity="0.45" strokeWidth="1.5" x1="0" x2="680" y1="0" y2="430" />
          <line opacity="0.45" strokeWidth="1.5" x1="1440" x2="760" y1="0" y2="430" />
          <line opacity="0.45" strokeWidth="1.5" x1="0" x2="680" y1="900" y2="470" />
          <line opacity="0.45" strokeWidth="1.5" x1="1440" x2="760" y1="900" y2="470" />
          <line opacity="0.7" x1="720" x2="720" y1="0" y2="360" />
          <line opacity="0.7" x1="720" x2="720" y1="900" y2="540" />
          <line opacity="0.7" x1="0" x2="620" y1="450" y2="450" />
          <line opacity="0.7" x1="1440" x2="820" y1="450" y2="450" />
          <line opacity="0.3" x1="180" x2="690" y1="90" y2="435" />
          <line opacity="0.3" x1="1260" x2="750" y1="90" y2="435" />
          <line opacity="0.3" x1="180" x2="690" y1="810" y2="465" />
          <line opacity="0.3" x1="1260" x2="750" y1="810" y2="465" />
        </g>
      </svg>
      <svg className="absolute inset-0 h-full w-full" data-hero-layer="constellation" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <g className="stroke-border" data-hero-layer="constellation-lines" opacity="0.45" strokeDasharray="3 3" strokeWidth="0.75">
          <path d="M220 280H310V460L240 470" />
          <path d="M480 480V300L550 390L620 300V480" />
          <path d="M820 480V300L890 390L960 300V480" />
          <path d="M1200 310 1120 380 1130 470 1210 480" />
        </g>
        <g className="fill-accent" data-hero-layer="constellation-nodes">
          <circle cx="220" cy="280" r="3" />
          <circle cx="310" cy="460" r="3" />
          <circle cx="480" cy="480" r="3" />
          <circle cx="620" cy="480" r="3" />
          <circle cx="820" cy="480" r="3" />
          <circle cx="960" cy="480" r="3" />
          <circle cx="1200" cy="310" r="3" />
          <circle cx="1210" cy="480" r="3" />
        </g>
      </svg>
      <svg className="absolute inset-0 h-full w-full" data-hero-layer="guides" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <path className="stroke-border" d="M0 450H1440M720 0V900" strokeDasharray="4 12" strokeWidth="1" />
        <path className="stroke-border opacity-60" d="M0 0 720 450 1440 0M0 900 720 450 1440 900" strokeWidth="1" />
        <circle className="fill-background stroke-accent" cx="720" cy="450" r="22" strokeWidth="1" />
        <circle className="fill-none stroke-border" cx="720" cy="450" r="96" strokeWidth="1" />
      </svg>
    </div>
  );
}

function HeroMonogram() {
  return (
    <div className="relative z-10 flex w-full items-center justify-between gap-space-sm px-1 sm:px-space-lg lg:px-space-xl" data-hero-element="monogram">
      <span aria-hidden="true" className="font-headline text-[10rem] font-light leading-none text-on-surface-variant opacity-40 sm:text-[15rem] lg:text-[21rem]" data-hero-element="bracket-left">
        {"{"}
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-space-sm sm:gap-space-lg lg:gap-space-xl">
        <span className="font-headline text-[4.5rem] font-bold leading-none tracking-[-0.08em] text-primary sm:text-[8rem] lg:text-[14rem]" data-hero-element="monogram-left">JM</span>
        <span aria-hidden="true" className="font-headline text-[4.5rem] leading-none text-accent sm:text-[8rem] lg:text-[12rem]" data-hero-element="star">✦</span>
        <span className="font-headline text-[4.5rem] font-bold leading-none tracking-[-0.08em] text-primary sm:text-[8rem] lg:text-[14rem]" data-hero-element="monogram-right">MC</span>
      </div>
      <span aria-hidden="true" className="font-headline text-[10rem] font-light leading-none text-on-surface-variant opacity-40 sm:text-[15rem] lg:text-[21rem]" data-hero-element="bracket-right">
        {"}"}
      </span>
    </div>
  );
}

function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[max(100svh-5rem,700px)] flex-col justify-between overflow-clip border-b border-border bg-surface-container-lowest px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
      <LandingHeroMotion>
        <HeroWarp />
        <div className="relative z-10 flex items-center justify-between gap-space-md border-b border-border pb-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant" data-hero-element="metadata">
        <span className="flex items-center gap-space-sm"><span aria-hidden="true" className="text-accent">✦</span>{"{ COORD: 40.4168° N, 3.7038° W }"}</span>
          <div className="hidden items-center gap-space-lg md:flex"><span>{"{ VELOCITY: C_WARP_0.98 }"}</span><span>{"{ VECTOR: KERNEL_PRODUCTION }"}</span></div>
          <span className="flex items-center gap-space-sm"><span aria-hidden="true" className="size-2 bg-accent motion-safe:animate-pulse" /><LandingUtcClock /></span>
        </div>

        <div className="relative z-10 grid gap-space-lg py-space-xl text-center" data-hero-element="stage">
          <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text" data-hero-element="eyebrow">JMMC // FULLSTACK DEVELOPER &amp; DESIGNER</p>
          <h1 className="sr-only" id="hero-title">JMMC — arquitectura fullstack y dirección de diseño</h1>
          <HeroMonogram />
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant sm:text-body-lg" data-hero-element="description">
            Arquitectura fullstack y dirección de diseño para productos digitales que necesitan claridad, velocidad y criterio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-sm" data-hero-element="cta">
            <LandingMotionLink className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-space-lg font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground" href="#presentacion">Entrar en el sistema</LandingMotionLink>
            <LandingMotionLink className="inline-flex min-h-12 items-center justify-center border border-border-strong px-space-lg font-headline text-label-caps uppercase tracking-[0.08em] text-primary" href="/es/demos" variant="outline">Abrir registro de demos</LandingMotionLink>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-space-md border-t border-border pt-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant sm:flex-row sm:items-center sm:justify-between" data-hero-element="rail">
          <Link className="transition-colors hover:text-primary" href="#presentacion">↓ desplazar para entrar en el sistema</Link>
          <span>{"{ FULLSTACK ARCHITECTURE / DESIGN SYSTEMS / MADRID }"}</span>
        </div>
      </LandingHeroMotion>
    </section>
  );
}

function PresentationSection() {
  const section = landingSections.presentacion;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ AVAILABLE FOR KEY CONTRACTS }" section={section} />
        <div className="grid gap-space-lg lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <div><CardMeta>JMMC / manifiesto de operación</CardMeta><CardTitle className="mt-space-sm text-headline-lg">Construir sin ruido</CardTitle></div>
              <Badge variant="active">Operativo</Badge>
            </CardHeader>
            <CardContent className="grid gap-space-lg">
              <p className="max-w-3xl text-body-lg text-on-surface-variant">Diseño sistemas donde la interfaz, los datos y la operación hablan el mismo idioma. Cada decisión visual tiene una razón técnica; cada decisión técnica puede explicarse a una persona.</p>
              <div className="grid gap-space-sm border-t border-border pt-space-lg font-mono text-mono-code uppercase tracking-[0.1em] text-on-surface-variant sm:grid-cols-3"><span>Madrid / remoto</span><span>Frontend + backend</span><span>Diseño + código</span></div>
              <div className="grid grid-cols-3 gap-space-md border-t border-border pt-space-lg">
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">+9</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Años de práctica</p></div>
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">100%</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Sistemas auditables</p></div>
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">&lt;80ms</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Latencia p99 media</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardContent className="grid h-full gap-space-md p-space-md">
              <div className="flex items-center justify-between border-b border-border pb-space-sm font-mono text-mono-code uppercase text-on-surface-variant"><span>{"{ PORTRAIT // ARCHIVE_2025 }"}</span><span className="text-accent">● LIVE</span></div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-space-sm"><span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant">{"{"}</span><div className="relative aspect-[4/5] overflow-clip bg-surface-container-highest"><Image alt="Retrato editorial monocromo de un arquitecto tecnológico en un estudio brutalista" className="h-full w-full object-cover grayscale contrast-125" height={1402} sizes="(min-width: 1024px) 28vw, 80vw" src="/assets/landing/portrait-archive-2025.png" width={1122} /><span className="absolute bottom-space-sm start-space-sm bg-background/85 px-space-sm py-space-xs font-mono text-mono-code text-primary">JMMC // ARCHITECT</span></div><span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant">{"}"}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-space-sm font-mono text-mono-code uppercase text-on-surface-variant"><span>HASH: 8F92-C1A0-77B4</span><span className="text-accent">✦ ENCRYPTED SIGNATURE</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function DemoStack() {
  const featuredDemo = demoRouteList[0];

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
      <div aria-hidden="true" className="hidden w-full scale-[0.88] -translate-y-12 bg-surface-container-highest/20 p-space-lg opacity-20 blur-sm md:block">
        <div className="flex justify-between font-mono text-mono-code text-outline">
          <span>{"{ 03 } CUALIFICA Y SIGUE TUS LEADS"}</span>
          <span>PIPELINE_AGENT</span>
        </div>
        <div className="h-44 bg-surface-container-low/40" />
      </div>
      <div aria-hidden="true" className="w-full scale-[0.94] -translate-y-8 bg-surface-container-high p-space-lg opacity-40 blur-[1px]">
        <div className="flex justify-between font-mono text-mono-code text-on-surface-variant">
          <span>{"{ 02 } AGENTE DE LEADS EN TIEMPO REAL"}</span>
          <span>AUTONOMOUS_SOCKET</span>
        </div>
        <div className="flex h-40 items-center justify-center bg-surface-container-low">
          <span className="font-mono text-mono-code text-outline">[ BUFFERING TELEMETRY STREAM... ]</span>
        </div>
      </div>

      <Card className="relative z-10 -mt-6 w-full bg-surface-container p-space-md md:p-space-xl">
        <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-border pb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="bg-accent px-space-sm py-space-xs font-mono text-mono-code font-bold text-background">{"{ 01 }"}</span>
            <span className="font-headline text-headline-md uppercase text-primary">{featuredDemo?.title ?? "CREA TU AGENTE AUTÓNOMO"}</span>
          </div>
          <span className="font-mono text-mono-code uppercase text-accent">✦ STACK: LLM / LANGCHAIN / POSTGRES</span>
        </div>

        <div className="grid gap-space-xl pt-space-lg lg:grid-cols-12 lg:items-center">
          <div className="grid gap-space-lg lg:col-span-5">
            <p className="text-body-md text-secondary">Motor orquestador que provisiona agentes conversacionales con memoria vectorial episódica, tool-calling determinista y validación estricta de esquemas en milisegundos.</p>
            <div className="grid gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
              <div className="flex justify-between border-b border-border py-space-sm"><span>LATENCIA_INFERENCIA</span><strong className="text-primary">142ms</strong></div>
              <div className="flex justify-between border-b border-border py-space-sm"><span>RETRIEVAL_ACCURACY</span><strong className="text-primary">99.4%</strong></div>
              <div className="flex justify-between border-b border-border py-space-sm"><span>VECTOR_STORE</span><strong className="text-primary">PGVECTOR / 1536 DIM</strong></div>
            </div>
            <Link className="inline-flex min-h-12 w-fit items-center gap-space-sm border border-primary bg-primary px-space-md font-headline text-label-caps uppercase text-primary-foreground transition-colors hover:border-accent hover:bg-background hover:text-primary active:scale-[0.98]" href={featuredDemo?.href ?? "/es/demos"}>
              <span aria-hidden="true" className="text-accent">✦</span>
              Iniciar demo interactiva
              <span className="font-mono text-mono-code">[ EXEC ]</span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-space-md lg:col-span-7">
            <div className="flex items-center justify-between border-b border-border pb-space-sm font-mono text-[0.6875rem] text-on-surface-variant">
              <span className="text-primary">AGENT_NODE_RUNNER.PY</span>
              <span>PORT: 8080 // SECURE</span>
            </div>
            <div className="grid gap-space-sm pt-space-md font-mono text-mono-code">
              <div className="flex items-center justify-between bg-surface-container p-space-sm text-on-surface-variant">
                <span>[IN] PROMPT: &quot;Configurar agente de soporte Nivel 2&quot;</span>
                <span className="text-accent">OK</span>
              </div>
              <div className="bg-surface-container-low p-space-md text-secondary">
                <p className="mb-space-sm text-accent">{"{ ✦ KERNEL DEPLOYMENT SEQUENCE }"}</p>
                <p className="text-mono-code leading-relaxed text-on-surface">
                  &gt; Vector store initialized at namespace: tenant_9021<br />
                  &gt; Tools registered: [sql_query, stripe_refund, slack_dispatch]<br />
                  &gt; System prompt compiled (tokens: 412, safety_guard: ON)
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
      </Card>
    </div>
  );
}

function DemosSection() {
  const section = landingSections.demos;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader action={<Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-primary" href="/es/demos">{"{ ABRIR REGISTRO COMPLETO → }"}</Link>} section={section} />
        <DemoStack />
      </div>
    </section>
  );
}

function SkillsSection() {
  const section = landingSections.skills;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ 04 / SYSTEMS / 99.4% DETERMINISTIC }" section={section} />
        <div className="grid gap-space-lg md:grid-cols-2">
          {capabilities.map((capability) => (
            <Card key={capability.index}>
              <CardHeader>
                <div>
                  <CardMeta>{`${capability.index} / ${capability.stack}`}</CardMeta>
                  <CardTitle className="mt-space-sm">{capability.title}</CardTitle>
                </div>
                <Badge variant="active">{capability.metric}</Badge>
              </CardHeader>
              <CardContent className="grid gap-space-lg">
                <p className="text-body-md text-on-surface-variant">{capability.description}</p>
                <div aria-label={`${capability.title}: ${capability.score}%`} className="grid gap-space-sm" role="img">
                  <div className="flex justify-between font-mono text-mono-code uppercase tracking-[0.1em] text-on-surface-variant">
                    <span>Índice de dominio</span>
                    <span>{capability.score}%</span>
                  </div>
                  <div className="h-2 border border-border bg-surface-lowest p-px">
                    <span className="block h-full bg-primary" style={{ width: `${capability.score}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrajectorySection() {
  const section = landingSections.trayectoria;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ INVERSE REGISTER / 2019 — NOW }" section={section} />
        <ol className="grid gap-space-xl border-s border-border ps-space-lg lg:gap-0 lg:ps-0">
          {timeline.map((entry, index) => (
            <li className="relative grid gap-space-lg lg:grid-cols-12 lg:gap-space-xl" key={entry.period}>
              <span aria-hidden="true" className="absolute -start-[calc(var(--primitive-space-lg)+0.25rem)] top-space-sm size-2 bg-accent lg:start-[calc(50%-0.25rem)]" />
              <div className={`grid content-start gap-space-xs lg:col-span-5 ${index % 2 === 1 ? "lg:col-start-8" : "lg:col-start-1"}`}>
                <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent-text">{entry.period}</p>
                <p className="font-headline text-headline-md uppercase text-primary">{entry.role}</p>
                <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{entry.company}</p>
              </div>
              <Card className={`lg:col-span-5 ${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-8"}`}>
                <CardContent><p className="text-body-md text-on-surface-variant">{entry.detail}</p></CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BlogSection() {
  const section = landingSections.blog;
  const [featuredPost, ...archivePosts] = posts;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader action={<Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-accent" href="/es/blog/editor">{"{ ACCESO MIEMBROS [✦] }"}</Link>} section={section} />
        <div className="grid gap-space-xl lg:grid-cols-12 lg:items-center">
          <div aria-hidden="true" className="hidden h-80 flex-col justify-between bg-surface-container-high p-space-md opacity-30 blur-[1px] lg:col-span-2 lg:flex">
            <span className="font-mono text-mono-code text-accent">{"{ PREV_POST }"}</span>
            <span className="font-headline text-headline-md uppercase leading-none text-on-surface-variant">Matemática del renderizado en GPU</span>
            <span className="font-mono text-[0.6875rem] text-outline">READ: 8 MIN</span>
          </div>

          <Card className="p-space-md lg:col-span-8 md:p-space-xl">
            <div className="grid gap-space-lg md:grid-cols-12 md:items-center md:gap-space-xl">
              <div className="relative aspect-[4/3] overflow-clip bg-surface-container-highest md:col-span-5">
                <Image alt="Estructura brutalista de hormigón con diagonales geométricas y sombras duras" className="h-full w-full object-cover grayscale contrast-125" height={1086} sizes="(min-width: 1024px) 28vw, 90vw" src="/assets/landing/featured-architecture-2025.png" width={1448} />
                <span className="absolute top-space-sm start-space-sm bg-background/90 px-space-sm py-space-xs font-mono text-mono-code text-accent">{"{ 01 // FEATURED }"}</span>
              </div>
              <div className="flex h-full flex-col justify-between gap-space-lg md:col-span-7">
                <div>
                  <div className="mb-space-sm flex items-center justify-between gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
                    <span className="text-accent">{`{ ${featuredPost?.category ?? "ARQUITECTURA DISTRIBUIDA"} }`}</span>
                    <span>28 FEB 2025</span>
                  </div>
                  <h3 className="font-headline text-headline-lg uppercase leading-tight text-primary transition-colors hover:text-accent">{featuredPost?.title}</h3>
                  <p className="mt-space-sm text-body-md text-secondary">Un análisis exhaustivo sobre el coste oculto de la latencia de red, el overhead cognitivo de infraestructura y la orquestación cuando se fragmentan dominios antes de tiempo.</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-md border-t border-border pt-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
                  <span>{`{ TIEMPO DE LECTURA: ${featuredPost?.readingTime ?? "14 MIN"} }`}</span>
                  <Link className="text-primary transition-colors hover:text-accent" href={featuredPost?.href ?? "/es/blog/editor"}>[ LEER DOSSIER ] <span className="text-accent">→</span></Link>
                </div>
              </div>
            </div>
            <div className="mt-space-lg flex items-center justify-between border-t border-border pt-space-md font-mono text-mono-code text-on-surface-variant">
              <span className="text-accent">✦</span>
              <span className="flex gap-space-sm"><span className="h-1 w-8 bg-accent" /><span className="h-1 w-3 bg-surface-container-highest" /><span className="h-1 w-3 bg-surface-container-highest" /></span>
              <span>{"{ 01 / 03 }"}</span>
            </div>
          </Card>

          <div aria-hidden="true" className="hidden h-80 flex-col justify-between bg-surface-container-high p-space-md opacity-30 blur-[1px] lg:col-span-2 lg:flex">
            <span className="font-mono text-mono-code text-accent">{"{ NEXT_POST }"}</span>
            <span className="font-headline text-headline-md uppercase leading-none text-on-surface-variant">Interfaces que resisten</span>
            <span className="font-mono text-[0.6875rem] text-outline">READ: 6 MIN</span>
          </div>
        </div>
        <EditorialList ariaLabel="Archivo de publicaciones" items={archivePosts.map((post) => ({ href: post.href, id: post.id, meta: `${post.category} / ${post.readingTime}`, title: post.title }))} />
      </div>
    </section>
  );
}

function ContactSection() {
  const section = landingSections.contacto;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <header className="mx-auto grid max-w-4xl gap-space-md text-center">
          <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-accent-text">{`[ SECTION // ${section.index} ]`} {section.eyebrow}</p>
          <h2 className="font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id={`${section.id}-title`}>{section.title}</h2>
          <p className="text-body-lg text-on-surface-variant">Un producto claro empieza por una conversación precisa. Cuéntame qué sistema necesita tomar forma.</p>
        </header>

        <div className="grid gap-space-lg lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader>
              <div><CardMeta>Canal / transmisión mock</CardMeta><CardTitle className="mt-space-sm">Abrir una conversación</CardTitle></div>
              <Badge variant="active">Sin backend</Badge>
            </CardHeader>
            <CardContent className="grid gap-space-lg">
              <ContactForm />
            </CardContent>
          </Card>

          <div className="grid gap-space-lg lg:col-span-7 lg:grid-cols-2">
            <Card><CardContent className="grid gap-space-sm"><CardMeta>Canal / correo</CardMeta><a className="break-all font-headline text-headline-md uppercase text-primary transition-colors hover:text-accent" href="mailto:hola@jmmcdevsign.es">hola@jmmcdevsign.es</a><p className="text-body-sm text-on-surface-variant">Respuesta inicial en menos de 48 horas operativas.</p></CardContent></Card>
            <Card><CardContent className="grid gap-space-sm"><CardMeta>Localización / horario</CardMeta><p className="font-headline text-headline-md uppercase text-primary">Madrid / remoto</p><p className="text-body-sm text-on-surface-variant">Disponibilidad coordinada para proyectos clave.</p></CardContent></Card>
            <Card className="lg:col-span-2"><CardContent className="flex flex-wrap items-center justify-between gap-space-lg"><div><CardMeta>Contrato visual / operativo</CardMeta><p className="mt-space-sm font-headline text-headline-lg uppercase text-primary">Sistemas que perduran</p></div><LandingMotionLink className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground" href="mailto:hola@jmmcdevsign.es?subject=Proyecto%20JMMC">Enviar transmisión →</LandingMotionLink></CardContent></Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-surface px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto flex w-full max-w-[var(--layout-content-max)] flex-wrap items-center justify-between gap-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">
        <span>JMMC / entorno editorial brutalista</span>
        <span>{"{ STATUS: ALL SYSTEMS OPERATIONAL ✦ }"}</span>
        <a className="transition-colors hover:text-primary" href="mailto:hola@jmmcdevsign.es">hola@jmmcdevsign.es</a>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <PresentationSection />
      <DemosSection />
      <SkillsSection />
      <TrajectorySection />
      <BlogSection />
      <ContactSection />
      <LandingFooter />
    </main>
  );
}
