import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/app/es/_components/contact-form";
import { LandingBlogCarousel, type LandingCarouselPost } from "@/app/es/_components/landing-blog-carousel";
import { LandingCapabilities } from "@/app/es/_components/landing-capabilities";
import { LandingDemos } from "@/app/es/_components/landing-demos";
import { LandingHeroMotion } from "@/app/es/_components/landing-hero-motion";
import { LandingMotionLink } from "@/app/es/_components/landing-motion-link";
import { LandingProjects, type LandingProject } from "@/app/es/_components/landing-projects";
import { LandingTrajectory, type TrajectoryEntry } from "@/app/es/_components/landing-trajectory";
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

type LandingSectionId =
  | "presentacion"
  | "demos"
  | "skills"
  | "trayectoria"
  | "proyectos"
  | "servicios"
  | "blog"
  | "contacto";

type LandingSection = {
  id: LandingSectionId;
  index: string;
  eyebrow: string;
  title: string;
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
  proyectos: {
    id: "proyectos",
    index: "05",
    eyebrow: "Archivo / producto",
    title: "Proyectos seleccionados",
  },
  servicios: {
    id: "servicios",
    index: "06",
    eyebrow: "Oferta / colaboración",
    title: "Servicios",
  },
  blog: {
    id: "blog",
    index: "07",
    eyebrow: "Archivo / publicaciones",
    title: "Publicaciones técnicas",
  },
  contacto: {
    id: "contacto",
    index: "08",
    eyebrow: "Canal / contacto directo",
    title: "Construyamos algo que perdure",
  },
} satisfies Record<LandingSectionId, LandingSection>;

const timeline: readonly TrajectoryEntry[] = [
  {
    period: "08/2018 — 11/2019",
    role: "Angular Developer",
    company: "Everis (NTT Data)",
    detail: "Desarrollo front-end y diseño de la plataforma web de Orange con Angular e Ionic. Desarrollo backend con Node.js.",
  },
  {
    period: "11/2019 — 04/2020",
    role: "Frontend Developer | UI Designer",
    company: "Nateevo",
    detail: "Desarrollo web con JavaScript, jQuery y Pug. Implementación de diseños responsive con alta fidelidad. Control de versiones con Git.",
  },
  {
    period: "06/2020 — 06/2021",
    role: "Angular Developer",
    company: "Dimática Software",
    detail: "Desarrollo y mantenimiento de aplicaciones web con Angular, Material UI y Tailwind CSS. Control de versiones con Git.",
  },
  {
    period: "06/2021 — 05/2023",
    role: "Angular Developer",
    company: "ViewNext",
    detail: "Desarrollo front-end y diseño de la plataforma web del Banco Santander con Angular 14+ y TypeScript. CI/CD con GitHub. Desarrollo backend con Node.js.",
  },
  {
    period: "05/2023 — ACTUALIDAD",
    role: "Senior Angular Developer",
    company: "Accenture",
    detail: "Desarrollo de la aplicación web del Banco Santander con Angular 14+, TypeScript, Material UI y Tailwind CSS. Creación de componentes web reutilizables con Storybook. CI/CD con Jenkins.",
  },
  {
    period: "11/2025 — ACTUALIDAD",
    role: "Senior Frontend Developer",
    company: "Custos Mobile",
    detail: "Desarrollo de pasarelas de pago, dashboards de gestión remota de terminales y TPV. Gestión del equipo front, revisión de PR y diseño técnico de productos. Integración de IA, MCP, Skills y Agents. Storybook, Material UI, CI/CD con GitLab y GitHub.",
  },
];

const projects: readonly LandingProject[] = [
  {
    description: "Aplicación web bancaria para desktop y dispositivos móviles con Angular y Material UI.",
    name: "Banco Santander",
    stack: ["Angular", "TypeScript", "Material UI", "Tailwind"],
  },
  {
    description: "Plataforma digital para la compañía farmacéutica internacional.",
    name: "Almirall",
    stack: ["Angular", "TypeScript", "SASS"],
  },
  {
    description: "Plataforma web para el Barça con integración de servicios y contenido dinámico.",
    name: "FC Barcelona",
    stack: ["Angular", "TypeScript", "Node.js"],
  },
  {
    description: "Plataforma formativa y de gestión para La Masía del FC Barcelona.",
    name: "La Masía FCB",
    stack: ["Angular", "TypeScript", "UI/UX"],
  },
  {
    description: "Solución digital para la aseguradora con portal de clientes y gestión de pólizas.",
    name: "Mapfre",
    stack: ["Angular", "TypeScript", "SASS"],
  },
  {
    description: "Aplicación bancaria digital con gestión de productos y servicios financieros.",
    name: "Unicaja",
    stack: ["Angular", "TypeScript", "Tailwind"],
  },
  {
    description: "Portal web para el operador de telecomunicaciones con autogestión de clientes.",
    name: "Jazztel",
    stack: ["Angular", "JavaScript", "HTML5"],
  },
  {
    description: "Plataforma educativa digital con gestión de cursos y contenido multimedia.",
    name: "Eleia",
    stack: ["Angular", "TypeScript", "Node.js"],
  },
  {
    description: "Software de gestión clínica veterinaria con historiales y agenda digital.",
    name: "Clinvetia",
    stack: ["Angular", "TypeScript", "UI/UX"],
  },
  {
    description: "Aplicación empresarial para la gestión de proyectos y recursos.",
    name: "Dimática",
    stack: ["Angular", "Material UI", "SASS"],
  },
  {
    description: "Plataforma para la Escuela Superior de Música de Cataluña con gestión académica.",
    name: "ESMUC",
    stack: ["Angular", "TypeScript", "Tailwind"],
  },
  {
    description: "E-commerce y web corporativa para la marca de complementos.",
    name: "Flor de Loto",
    stack: ["Angular", "JavaScript", "CSS"],
  },
  {
    description: "Portal corporativo para la empresa de servicios informáticos.",
    name: "Sermicro",
    stack: ["Angular", "TypeScript", "SASS"],
  },
  {
    description: "Web corporativa y plataforma de servicios gráficos online.",
    name: "Servegraf",
    stack: ["Angular", "JavaScript", "HTML5"],
  },
];

const services = [
  {
    description: "Especialista en Angular y Storybook, creando librerías de componentes reutilizables con un enfoque pixel-perfect. Desarrollo interfaces modernas y accesibles, respaldado por un sólido backend con Spring Boot y Java.",
    index: "01",
    title: "Desarrollo Web Fullstack",
  },
  {
    description: "Automatización inteligente con Claude, MCP, Skills y Agents. Integro IA en flujos de trabajo reales para optimizar procesos, conectar herramientas y potenciar la productividad de tu negocio.",
    index: "02",
    title: "IA y Automatización",
  },
  {
    description: "Diseño y gestión de infraestructura cloud con Docker, AWS y CI/CD. Automatización de deploys, escalado y monitorización para entornos de producción.",
    index: "03",
    title: "Infraestructura DevOps",
  },
  {
    description: "Ayudo a empresas a destacar en el mundo digital. Desde definir la estrategia técnica hasta ejecutar productos que marquen la diferencia. Arquitectura, code review y visión de producto para equipos que quieren crecer.",
    index: "04",
    title: "Consultoría Técnica",
  },
];

const posts: readonly LandingCarouselPost[] = [
  {
    date: "28 FEB 2025",
    description: "Un análisis exhaustivo sobre el coste oculto de la latencia de red, el overhead cognitivo de infraestructura y la orquestación cuando se fragmentan dominios antes de tiempo.",
    id: "modular-monolith",
    image: "/assets/landing/featured-architecture-2025.png",
    imageAlt: "Estructura brutalista de hormigón con diagonales geométricas y sombras duras",
    title: "El ocaso de los microservicios caóticos: volviendo al monolito modular",
    category: "Arquitectura distribuida",
    readingTime: "14 MIN",
    href: "/es/blog/editor",
  },
  {
    date: "12 MAR 2025",
    description: "Una guía práctica para diseñar agentes que puedan usar herramientas, mantener límites claros y dejar una traza útil para las personas que los supervisan.",
    id: "agent-runtime",
    image: "/assets/comparativa.png",
    imageAlt: "Comparativa de identidad visual para un dossier sobre agentes de IA",
    title: "Agentes que ejecutan: de la instrucción a la ejecución",
    category: "Agentes de IA",
    readingTime: "08 MIN",
    href: "/es/blog/editor",
  },
  {
    date: "02 ABR 2025",
    description: "Cómo convertir decisiones visuales en contratos de interfaz que resisten el crecimiento de un producto y de los equipos que lo mantienen.",
    id: "design-contracts",
    image: "/assets/landing/Retrato.png",
    imageAlt: "Retrato editorial monocromo para un artículo sobre sistemas de diseño",
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
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-space-md border-b border-border pb-space-md font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant" data-hero-element="metadata">
          <span className="flex min-w-0 items-center gap-space-sm"><span aria-hidden="true" className="shrink-0 text-accent">✦</span><span className="truncate">{"{ COORD: 40.4168° N, 3.7038° W }"}</span></span>
          <div className="hidden items-center justify-self-center gap-space-lg text-center md:flex"><span>{"{ VELOCITY: C_WARP_0.98 }"}</span><span>{"{ VECTOR: KERNEL_PRODUCTION }"}</span></div>
          <span className="flex min-w-0 items-center justify-self-end gap-space-sm"><span aria-hidden="true" className="size-2 shrink-0 bg-accent motion-safe:animate-pulse" /><LandingUtcClock /></span>
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
              <div><CardMeta>JMMC / manifiesto de operación</CardMeta><CardTitle className="mt-space-sm text-headline-lg">Desarrollo fullstack con base en diseño</CardTitle></div>
              <Badge variant="active">Operativo</Badge>
            </CardHeader>
            <CardContent className="grid gap-space-lg">
              <div className="grid gap-space-md text-body-lg text-on-surface-variant">
                <p className="font-headline text-headline-md uppercase leading-tight text-primary">Desarrollo fullstack con base en diseño, visión de producto, IA aplicada y automatizaciones útiles.</p>
                <p>Soy un desarrollador fullstack con más de 13 años de experiencia creando productos digitales de principio a fin. Empecé en el mundo del diseño gráfico en la imprenta de mi padre, y esa base visual evolucionó hacia un perfil más completo donde conecto visión de producto, desarrollo y ejecución. Con los años he trabajado en todo el stack, participando en interfaces, lógica de negocio, integraciones y experiencias de producto escalables. Hoy también aporto un muy buen manejo aplicado de la IA, diseñando automatizaciones y flujos inteligentes para hacer los productos más útiles, eficientes y competitivos.</p>
                <p>Me gusta transformar necesidades complejas en soluciones digitales claras, con un enfoque práctico que equilibra calidad técnica, usabilidad e impacto de negocio. Me gusta trabajar en el punto donde se cruzan diseño, ingeniería e innovación práctica. Me motivan especialmente los proyectos que exigen estructura, iniciativa y capacidad para conectar ideas con ejecución real.</p>
                <p>Fuera del trabajo valoro viajar, hacer deporte, estar con mi familia y mantener conversaciones que me ayuden a seguir creciendo.</p>
              </div>
              <div className="grid gap-space-sm border-t border-border pt-space-lg font-mono text-mono-code uppercase tracking-[0.1em] text-on-surface-variant sm:grid-cols-3"><span>Madrid / remoto</span><span>Frontend + backend</span><span>Diseño + código</span></div>
              <div className="grid grid-cols-3 gap-space-md border-t border-border pt-space-lg">
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">+13</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Años de práctica</p></div>
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">100%</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Sistemas auditables</p></div>
                <div className="min-w-0"><p className="font-headline text-headline-xl text-primary">IA +</p><p className="break-words font-mono text-mono-code uppercase text-on-surface-variant">Automatización útil</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardContent className="grid h-full gap-space-md p-space-md">
              <div className="flex items-center justify-between border-b border-border pb-space-sm font-mono text-mono-code uppercase text-on-surface-variant"><span>{"{ PORTRAIT // ARCHIVE_2025 }"}</span><span className="text-accent">● LIVE</span></div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-space-sm"><span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant">{"{"}</span><div className="relative aspect-[4/5] overflow-clip bg-surface-container-highest"><Image alt="Retrato en blanco y negro de un desarrollador fullstack en un estudio" className="h-full w-full object-cover grayscale contrast-125" height={1402} sizes="(min-width: 1024px) 28vw, 80vw" src="/assets/landing/Retrato.png" width={1122} /><span className="absolute bottom-space-sm start-space-sm bg-background/85 px-space-sm py-space-xs font-mono text-mono-code text-primary">JMMC // FULLSTACK</span></div><span aria-hidden="true" className="font-headline text-headline-xl text-outline-variant">{"}"}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-space-sm font-mono text-mono-code uppercase text-on-surface-variant"><span>HASH: 8F92-C1A0-77B4</span><span className="text-accent">✦ ENCRYPTED SIGNATURE</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function DemosSection() {
  const section = landingSections.demos;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader action={<Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-primary" href="/es/demos">{"{ ABRIR REGISTRO COMPLETO → }"}</Link>} section={section} />
        <LandingDemos />
      </div>
    </section>
  );
}

function SkillsSection() {
  const section = landingSections.skills;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ 03 / MATRIX / ACTIVE SIGNALS }" section={section} />
        <LandingCapabilities />
      </div>
    </section>
  );
}

function TrajectorySection() {
  const section = landingSections.trayectoria;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ INVERSE REGISTER / 08/2018 — NOW }" section={section} />
        <LandingTrajectory entries={timeline} />
      </div>
    </section>
  );
}

function ProjectsSection() {
  const section = landingSections.proyectos;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ ARCHIVE / PRODUCT SURFACES }" section={section} />
        <LandingProjects projects={projects} />
      </div>
    </section>
  );
}

function ServicesSection() {
  const section = landingSections.servicios;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface-container-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader aside="{ CONTRACTS / CLEAR SCOPE / REAL DELIVERY }" section={section} />
        <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card className="group flex min-h-[22rem] flex-col transition-colors hover:border-accent" key={service.index}>
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
      </div>
    </section>
  );
}

function BlogSection() {
  const section = landingSections.blog;

  return (
    <section aria-labelledby={`${section.id}-title`} className="border-b border-border bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop" id={section.id}>
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SectionHeader action={<Link className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant transition-colors hover:text-accent" href="/es/blog/editor">{"{ ACCESO MIEMBROS [✦] }"}</Link>} section={section} />
        <LandingBlogCarousel posts={posts} />
        <EditorialList ariaLabel="Archivo de publicaciones" items={posts.map((post) => ({ href: post.href, id: post.id, meta: `${post.category} / ${post.readingTime}`, title: post.title }))} />
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
          <p className="font-mono text-mono-code uppercase tracking-[0.16em] text-accent-text">{`[ SECTION // ${section.index} // TRANSMISIÓN DIRECTA ]`}</p>
          <h2 className="font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero" id={`${section.id}-title`}>{`{ ${section.title} }`}</h2>
          <p className="text-body-lg text-on-surface-variant">Disponible para liderazgo de arquitectura técnica, auditorías de rendimiento crítico y contratos de ingeniería avanzada.</p>
        </header>

        <div className="mx-auto grid w-full max-w-5xl items-start gap-gutter-desktop lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-space-xl bg-surface-container p-space-lg lg:col-span-5">
            <div>
              <div className="mb-space-lg border-b border-border pb-space-sm font-mono text-mono-code text-accent">{`{ TELEMETRÍA DE CONTACTO }`}</div>
              <div className="grid gap-space-lg font-mono text-mono-code">
                <div>
                  <p className="text-[0.6875rem] uppercase text-on-surface-variant">Direct dispatch:</p>
                  <a className="break-all font-headline text-headline-md text-primary transition-colors hover:text-accent" href="mailto:hola@jmmcdevsign.es">hola@jmmcdevsign.es</a>
                </div>
                <div>
                  <p className="text-[0.6875rem] uppercase text-on-surface-variant">Localización / horario:</p>
                  <p className="text-body-md text-secondary">Madrid, España // local</p>
                </div>
                <div>
                  <p className="text-[0.6875rem] uppercase text-on-surface-variant">Respuesta promedio:</p>
                  <p className="text-body-md text-secondary">&lt; 48 HORAS EN DÍAS HÁBILES</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-space-md">
              <p className="mb-space-sm font-mono text-mono-code text-on-surface-variant">[ REDES SIN RUIDO ]</p>
              <div className="flex flex-wrap gap-space-sm font-mono text-mono-code">
                <a className="bg-surface-container-high px-space-sm py-space-xs text-on-surface transition-colors hover:bg-surface-container-highest hover:text-primary" href="#contacto">[ GITHUB ]</a>
                <a className="bg-surface-container-high px-space-sm py-space-xs text-on-surface transition-colors hover:bg-surface-container-highest hover:text-primary" href="#contacto">[ LINKEDIN ]</a>
                <a className="bg-surface-container-high px-space-sm py-space-xs text-on-surface transition-colors hover:bg-surface-container-highest hover:text-primary" href="#contacto">[ X / TWITTER ]</a>
              </div>
            </div>
          </div>

          <div className="bg-surface-container p-space-lg md:p-space-xl lg:col-span-7">
            <ContactForm />
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
      <ProjectsSection />
      <ServicesSection />
      <BlogSection />
      <ContactSection />
      <LandingFooter />
    </main>
  );
}
