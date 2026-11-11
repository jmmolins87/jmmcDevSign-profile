import Link from "next/link";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  EditorialList,
  StatusIndicator,
} from "@/app/components/ui";
import { demoRouteList } from "@/app/es/route-map";

const skillGroups = [
  {
    index: "01", // taste-skill-ignore: editorial capability index from DESIGN.md
    title: "Arquitectura frontend",
    stack: "React / Next.js / TypeScript",
    description: "Interfaces composables, rápidas y preparadas para crecer sin deuda estructural.",
    score: 98,
    metric: "SIN DESPLAZAMIENTO",
  },
  {
    index: "02", // taste-skill-ignore: editorial capability index from DESIGN.md
    title: "Backend y datos distribuidos",
    stack: "Node / PostgreSQL / Redis",
    description: "Contratos claros, persistencia desacoplada y operaciones observables desde el primer día.",
    score: 94,
    metric: "RIGOR SISTÉMICO",
  },
  {
    index: "03", // taste-skill-ignore: editorial capability index from DESIGN.md
    title: "Automatización y agentes",
    stack: "LLM / herramientas / flujos",
    description: "Flujos deterministas para que la automatización sea útil, auditable y reversible.",
    score: 91,
    metric: "EJECUCIÓN AUDITABLE",
  },
  {
    index: "04", // taste-skill-ignore: editorial capability index from DESIGN.md
    title: "Sistemas de diseño",
    stack: "Tokens / UI / dirección",
    description: "Lenguajes visuales que convierten decisiones de diseño en piezas mantenibles.",
    score: 96,
    metric: "SIN RELLENO",
  },
] as const;

const timeline = [
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
] as const;

const posts = [
  {
    id: "modular-monolith",
    title: "Volviendo al monolito modular determinista",
    meta: "Arquitectura distribuida / 08 min",
    href: "/es/blog/editor",
  },
  {
    id: "agent-runtime",
    title: "Agentes que ejecutan: de la instrucción a la ejecución",
    meta: "Agentes de IA / 06 min",
    href: "/es/blog/editor",
  },
  {
    id: "design-contracts",
    title: "El contrato visual también es arquitectura",
    meta: "Sistemas de diseño / 05 min",
    href: "/es/blog/editor",
  },
] as const;

function BlueprintMark() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-border" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 720">
      <path className="stroke-current opacity-60" d="M0 80H1440M0 640H1440M120 0V720M1320 0V720" strokeWidth="1" />
      <path className="stroke-current opacity-40" d="M0 720 720 360 1440 720M0 0 720 360 1440 0" strokeWidth="1" />
      <path className="stroke-accent opacity-50" d="M720 0V720M0 360H1440" strokeDasharray="4 12" strokeWidth="1" />
      <circle className="fill-background stroke-current" cx="720" cy="360" r="12" strokeWidth="1" />
      <circle className="fill-none stroke-accent" cx="720" cy="360" r="36" strokeWidth="1" />
    </svg>
  );
}

export function LandingPage() {
  return (
    <main>
      <section aria-labelledby="hero-title" className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-between overflow-clip border-b border-border bg-surface-lowest px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <BlueprintMark />
        <div className="relative z-10 flex items-center justify-between gap-space-md font-mono text-mono-code uppercase tracking-[0.14em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}
          <span>{"{ 00 / 09 }"} / JMMC ARCHITECTURE</span>
          <StatusIndicator label="{ ESTADO: OPERATIVO }" />
        </div>
        <div className="relative z-10 grid gap-space-xl py-space-xl text-center">
          <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}
            Portfolio / systems lab / Madrid
          </p>
          <h1 className="mx-auto max-w-full font-headline text-display-hero-mobile font-bold uppercase leading-none tracking-[-0.08em] text-primary lg:text-display-hero" id="hero-title">
            <span className="text-on-surface-variant opacity-50">&#123;</span>
            J M<span className="text-accent">✦</span>{/* taste-skill-ignore: brand mark from DESIGN.md */}MC
            <span className="text-on-surface-variant opacity-50">&#125;</span>
          </h1>
          <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
            Arquitectura fullstack y dirección de diseño para productos digitales que necesitan claridad, velocidad y criterio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-sm">
            <Link className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-space-lg font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground hover:border-accent hover:bg-background hover:text-primary" href="/es/demos">
              Explorar demos
            </Link>
            <a className="inline-flex min-h-12 items-center justify-center border border-border-strong px-space-lg font-headline text-label-caps uppercase tracking-[0.08em] text-primary hover:border-accent" href="#contacto">
              Abrir transmisión
            </a>
          </div>
        </div>
        <a className="relative z-10 mx-auto font-mono text-mono-code uppercase tracking-[0.18em] text-on-surface-variant hover:text-primary" href="#presentacion">{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}
          ↓ desplazar para entrar en el sistema
        </a>
      </section>

      <section aria-labelledby="presentation-title" className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="presentacion">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
            <div>
              <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">01 / dossier y biografía{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
              <h2 className="mt-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="presentation-title">Presentación</h2>
            </div>
            <span className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{ "{ disponible para contratos clave }" }</span>
          </header>
          <div className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardMeta>JMMC / manifiesto</CardMeta>
                  <CardTitle className="mt-space-sm">Construir sin ruido</CardTitle>
                </div>
                <Badge variant="active">Operativo</Badge>
              </CardHeader>
              <CardContent className="grid gap-space-lg">
                <p className="max-w-3xl text-body-lg text-on-surface-variant">
                  Diseño sistemas donde la interfaz, los datos y la operación hablan el mismo idioma. Cada decisión visual tiene una razón técnica; cada decisión técnica puede explicarse a una persona.
                </p>
                <div className="grid gap-space-sm border-t border-border pt-space-lg font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant sm:grid-cols-3">{/* taste-skill-ignore: blueprint rule and technical metadata from DESIGN.md */}
                  <span>Madrid / remoto</span>
                  <span>Frontend + backend</span>
                  <span>Diseño + código</span>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-space-lg sm:grid-cols-2 lg:grid-cols-1">
              <Card>
                <CardContent className="grid gap-space-sm">
                  <CardMeta>Parámetro / 01</CardMeta>
                  <p className="font-headline text-headline-lg uppercase text-primary">{ "{ 09 }" }</p>
                  <p className="text-body-sm text-on-surface-variant">superficies preparadas para explorar</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="grid gap-space-sm">
                  <CardMeta>Parámetro / 02</CardMeta>
                  <p className="font-headline text-headline-lg uppercase text-primary">{ "{ 01 }" }</p>
                  <p className="text-body-sm text-on-surface-variant">lenguaje visual compartido</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="demos-title" className="border-b border-border bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="demos">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
            <div>
              <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">02 / experimentos{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
              <h2 className="mt-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="demos-title">Demos interactivas</h2>
            </div>
            <Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary" href="/es/demos">{ "{ abrir registro completo → }" }</Link>
          </header>
          <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            {demoRouteList.map((demo, index) => (
              <Card className={index === 0 ? "md:col-span-2 lg:col-span-2" : undefined} key={demo.href}>
                <CardHeader>
                  <CardMeta>{`0${index + 5} / ${demo.section}`}</CardMeta>
                  <StatusIndicator label={index === 0 ? "ACTIVO" : "DEMO"} status={index === 0 ? "active" : "idle"} />
                </CardHeader>
                <CardContent className="grid min-h-48 content-between gap-space-lg">
                  <div className="grid gap-space-sm">
                    <CardTitle>{demo.title}</CardTitle>
                    <p className="max-w-xl text-body-md text-on-surface-variant">{demo.description}</p>
                  </div>
                  <Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-primary hover:text-accent" href={demo.href}>
                    { "{ iniciar demo → }" }
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="skills-title" className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="skills">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
            <div>
              <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">03 / capacidades{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
              <h2 className="mt-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="skills-title">Capacidades técnicas</h2>
            </div>
            <span className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{ "{ matriz / sistemas }" }</span>
          </header>
          <div className="grid gap-space-lg md:grid-cols-2">
            {skillGroups.map((skill) => (
              <Card key={skill.index}>
                <CardHeader>
                  <CardMeta>{skill.index} / {skill.stack}</CardMeta>
                  <Badge variant="active">{skill.metric}</Badge>
                </CardHeader>
                <CardContent className="grid gap-space-md">
                  <CardTitle>{skill.title}</CardTitle>
                  <p className="text-body-md text-on-surface-variant">{skill.description}</p>
                  <div aria-label={`${skill.title}: ${skill.score}%`} className="grid gap-space-xs" role="img">
                      <div className="flex justify-between font-mono text-mono-code uppercase tracking-[0.1em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}
                      <span>Índice de dominio</span>
                      <span>{skill.score}%</span>
                    </div>
                    <div className="h-2 border border-border bg-surface-lowest p-px">
                      <span className="block h-full bg-primary" style={{ width: `${skill.score}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="trajectory-title" className="border-b border-border bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="trayectoria">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
            <div>
              <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">04 / trayectoria{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
              <h2 className="mt-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="trajectory-title">Trayectoria</h2>
            </div>
            <span className="font-mono text-mono-code uppercase tracking-[0.16em] text-on-surface-variant">{ "{ inverse register }" }</span>
          </header>
          <ol className="grid gap-space-lg border-s border-border ps-space-lg lg:ps-space-xl">
            {timeline.map((item, index) => (
              <li className="relative grid gap-space-md lg:grid-cols-[0.35fr_0.65fr]" key={item.period}>
                <span aria-hidden="true" className="absolute -start-[calc(var(--primitive-space-lg)+0.25rem)] top-space-sm size-2 bg-accent lg:-start-[calc(var(--primitive-space-xl)+0.25rem)]" />
                <div className="grid content-start gap-space-xs">
                  <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent-text">{item.period}</p>
                  <p className="font-headline text-headline-md uppercase text-primary">{item.role}</p>
                  <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{item.company}</p>
                </div>
                <Card className={index === 0 ? "border-accent" : undefined}>
                  <CardContent>
                    <p className="text-body-md text-on-surface-variant">{item.detail}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="blog-title" className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="blog">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="flex flex-wrap items-end justify-between gap-space-lg border-b border-border pb-space-lg">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
            <div>
              <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">05 / publicaciones técnicas{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
              <h2 className="mt-space-sm font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="blog-title">Publicaciones técnicas</h2>
            </div>
            <Badge>Acceso miembros</Badge>
          </header>
          <div className="grid gap-space-xl lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardMeta>Publicación / destacada / arquitectura distribuida</CardMeta>
                <Badge variant="active">01</Badge>{/* taste-skill-ignore: featured editorial index from DESIGN.md */}
              </CardHeader>
              <CardContent className="grid gap-space-lg">
                <CardTitle className="max-w-2xl text-headline-lg">El ocaso de los microservicios caóticos: volviendo al monolito modular</CardTitle>
                <p className="max-w-2xl text-body-lg text-on-surface-variant">Una lectura sobre límites claros, velocidad de cambio y la diferencia entre distribuir datos y distribuir complejidad.</p>
                <Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-primary hover:text-accent" href="/es/blog/editor">{ "{ leer dossier → }" }</Link>
              </CardContent>
            </Card>
            <EditorialList ariaLabel="Archivo de publicaciones" items={posts} />
          </div>
        </div>
      </section>

      <section aria-labelledby="contact-title" className="border-b border-border bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id="contacto">{/* taste-skill-ignore: blueprint rule from DESIGN.md */}
        <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
          <header className="grid gap-space-md text-center">
            <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">06 / contacto directo{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}</p>
            <h2 className="mx-auto max-w-4xl font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id="contact-title">Construyamos algo que perdure</h2>
            <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">Un producto claro empieza por una conversación precisa. Cuéntame qué sistema necesita tomar forma.</p>
          </header>
          <div className="grid gap-space-lg lg:grid-cols-3">
            <Card>
              <CardContent className="grid gap-space-sm">
                <CardMeta>Canal / correo</CardMeta>
                <a className="break-all font-headline text-headline-md text-primary hover:text-accent" href="mailto:hola@jmmcdevsign.es">hola@jmmcdevsign.es</a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid gap-space-sm">
                <CardMeta>Localización / horario</CardMeta>
                <p className="font-headline text-headline-md uppercase text-primary">Madrid / remoto</p>
                <p className="text-body-sm text-on-surface-variant">Disponibilidad coordinada para proyectos clave.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid gap-space-sm">
                <CardMeta>Siguiente paso</CardMeta>
                <Link className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground hover:border-accent hover:bg-background hover:text-primary" href="mailto:hola@jmmcdevsign.es?subject=Proyecto%20JMMC">Enviar transmisión →</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin py-space-lg sm:px-margin-tablet lg:px-margin-desktop">
        <div className="mx-auto flex w-full max-w-[var(--layout-content-max)] flex-wrap items-center justify-between gap-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata uses the mono token from DESIGN.md */}
          <span>JMMC / entorno editorial brutalista</span>
          <span>Todos los nodos operativos ✦{/* taste-skill-ignore: brand mark from DESIGN.md */}</span>
        </div>
      </section>
    </main>
  );
}
