/* SPEC 01 — Paso 2: contenido de la landing como datos TS tipados.
   Datos portados de references/01_landing/code.html.
   Todo contenido de ejemplo lleva // [placeholder]. Las imágenes se
   mantienen por hotlink por decisión de la spec (spec futura las localiza). */

export type StackGroup = {
  title: string;
  note: string;
  skills: { name: string; level: number; tag?: string }[];
};

export type TimelineEntry = {
  period: string;
  role: string;
  company: string;
  body: string;
  tags: string[];
};

export type Project = {
  index: string;
  category: string;
  title: string;
  body: string;
  tags: string[];
};

export type Service = {
  index: string;
  icon: string;
  title: string;
  body: string;
  meta: string;
};

export type DemoRow = {
  badge: string;
  live: boolean;
  title: string;
  body: string;
  href: string;
};

export type NavItem = {
  index: string;
  label: string;
  /* Hash de la landing: cada sección renderiza su Section id correspondiente. */
  href: string;
};


export const stackGroups: StackGroup[] = [
  {
    title: "Frameworks Front", // [placeholder]
    note: "UI & Core", // [placeholder]
    skills: [
      { name: "Angular", level: 92, tag: "Principal" }, // [placeholder]
      { name: "React", level: 85 }, // [placeholder]
      { name: "Next.js", level: 85 }, // [placeholder]
      { name: "Astro", level: 70 }, // [placeholder]
    ],
  },
  {
    title: "Backend", // [placeholder]
    note: "APIs & Microservicios", // [placeholder]
    skills: [
      { name: "Java (Spring Boot)", level: 75 }, // [placeholder]
      { name: "Node.js / Express", level: 82 }, // [placeholder]
      { name: "PostgreSQL & Prisma", level: 80 }, // [placeholder]
    ],
  },
  {
    title: "Devtools & CI/CD", // [placeholder]
    note: "Infraestructura", // [placeholder]
    skills: [
      { name: "Docker & Containers", level: 80 }, // [placeholder]
      { name: "GitLab CI / Runners", level: 80 }, // [placeholder]
      { name: "GitHub Actions", level: 90 }, // [placeholder]
    ],
  },
  {
    title: "Cloud & Automatización", // [placeholder]
    note: "Inteligencia", // [placeholder]
    skills: [
      { name: "Azure Cloud", level: 70 }, // [placeholder]
      { name: "AWS (S3, Lambda, CloudFront)", level: 65 }, // [placeholder]
      { name: "Automatizaciones & IA (LLMs, LangChain)", level: 85 }, // [placeholder]
    ],
  },
];

export const timeline: TimelineEntry[] = [
  {
    period: "2024 — Actualidad", // [placeholder]
    role: "Senior Frontend & Creative Technologist", // [placeholder]
    company: "Estudio Sintagma / Fintech Global", // [placeholder]
    body: "Liderazgo de arquitectura de micro-frontends en Angular y React. Integración de pipelines analíticos en tiempo real y diseño de sistemas interactivos cinematográficos para banca corporativa.", // [placeholder]
    tags: ["Angular", "TypeScript", "Design Systems"], // [placeholder]
  },
  {
    period: "2022 — 2024", // [placeholder]
    role: "Fullstack Engineer & UI Specialist", // [placeholder]
    company: "Nexus Dynamics", // [placeholder]
    body: "Desarrollo de servicios resilientes en Java Spring Boot con despliegue en contenedores Docker. Reingeniería del frontend principal a Next.js mejorando métricas Core Web Vitals en un 42%.", // [placeholder]
    tags: ["Java Spring", "Next.js", "Docker"], // [placeholder]
  },
  {
    period: "2020 — 2022", // [placeholder]
    role: "Product Designer & Web Developer", // [placeholder]
    company: "Agencia Hyperion", // [placeholder]
    body: "Creación de experiencias inmersivas para clientes del sector lujo y retail. Implementación integral desde wireframes y prototipos Figma hasta código frontend con microanimaciones SVG y Canvas.", // [placeholder]
    tags: ["Figma", "React", "Tailwind"], // [placeholder]
  },
  {
    period: "2018 — 2020", // [placeholder]
    role: "Junior Frontend Developer", // [placeholder]
    company: "Vortex Labs", // [placeholder]
    body: "Construcción de módulos interactivos en JavaScript modular, maquetación de interfaces responsivas e integración con REST APIs bajo metodologías ágiles.", // [placeholder]
    tags: ["JavaScript ES6", "Git", "REST APIs"], // [placeholder]
  },
];

export const projects: Project[] = [
  {
    index: "01", // [placeholder]
    category: "FinTech Analytics", // [placeholder]
    title: "Kaelo Platform", // [placeholder]
    body: "Plataforma de inteligencia financiera con visualización en tiempo real de liquidez multi-divisa y gestión de tesorería automatizada.", // [placeholder]
    tags: ["Angular 17", "RxJS", "Tailwind"], // [placeholder]
  },
  {
    index: "02", // [placeholder]
    category: "E-Commerce Editorial", // [placeholder]
    title: "Atelier Solstice", // [placeholder]
    body: "Catálogo interactivo de diseño con checkout headless, microanimaciones cinemáticas y sincronización instantánea de stock global.", // [placeholder]
    tags: ["Next.js", "Shopify Storefront", "Anime.js"], // [placeholder]
  },
  {
    index: "03", // [placeholder]
    category: "Automation & AI", // [placeholder]
    title: "Synapse Core", // [placeholder]
    body: "Motor de orquestación de prompts para equipos de operaciones legales, con extracción estructurada de contratos en segundos.", // [placeholder]
    tags: ["Python", "OpenAI API", "FastAPI"], // [placeholder]
  },
  {
    index: "04", // [placeholder]
    category: "SaaS Enterprise", // [placeholder]
    title: "Vesta Workspace", // [placeholder]
    body: "Suite modular para despachos de arquitectura: control de presupuestos, horas por hito y renders en alta resolución integrados.", // [placeholder]
    tags: ["React", "PostgreSQL", "Docker"], // [placeholder]
  },
];

export const services: Service[] = [
  {
    index: "01", // [placeholder]
    icon: "draw", // [placeholder]
    title: "Diseño UI/UX", // [placeholder]
    body: "Sistemas visuales editoriales, prototipado fidedigno, pruebas con usuarios y directrices de accesibilidad AA/AAA.", // [placeholder]
    meta: "Figma · Design Systems", // [placeholder]
  },
  {
    index: "02", // [placeholder]
    icon: "terminal", // [placeholder]
    title: "Desarrollo web a medida", // [placeholder]
    body: "Aplicaciones front-to-back de alto rendimiento construidas con Angular, Next.js, Java y bases de datos estructuradas.", // [placeholder]
    meta: "Fullstack · TypeScript · APIs", // [placeholder]
  },
  {
    index: "03", // [placeholder]
    icon: "tune", // [placeholder]
    title: "Automatización de procesos", // [placeholder]
    body: "Conexión de pipelines comerciales, sincronización CRM, webhooks e infraestructura CI/CD sin puntos únicos de fallo.", // [placeholder]
    meta: "Webhooks · CI/CD · Cloud", // [placeholder]
  },
  {
    index: "04", // [placeholder]
    icon: "psychology", // [placeholder]
    title: "Integración de IA", // [placeholder]
    body: "Despliegue de agentes RAG, modelos semánticos locales o en la nube para análisis predictivo y soporte automatizado.", // [placeholder]
    meta: "LLMs · Embeddings · Agents", // [placeholder]
  },
];

export const demos: DemoRow[] = [
  {
    badge: "En vivo", // [placeholder]
    live: true, // [placeholder]
    title: "Agente de leads", // [placeholder]
    body: "Recibe leads, los cualifica y automatiza el seguimiento comercial mediante agentes conversacionales autónomos.", // [placeholder]
    href: "/demos/leads", // [placeholder]
  },
  {
    badge: "Demo", // [placeholder]
    live: false, // [placeholder]
    title: "Pedidos en tiempo real", // [placeholder]
    body: "Sistema de pedidos para tiendas: los cambios de estado se sincronizan al instante vía WebSockets sin recargar.", // [placeholder]
    href: "#", // [placeholder]
  },
  {
    badge: "Demo", // [placeholder]
    live: false, // [placeholder]
    title: "Software de gestión (SaaS)", // [placeholder]
    body: "Gestiona tu negocio desde un único panel consolidado con facturación, clientes e inventario unificado.", // [placeholder]
    href: "#", // [placeholder]
  },
];

/* SPEC 05 — Paso 5: mapa de navegación del overlay (los ids coinciden con
   los Section id de la landing de SPEC 01). Marcado [placeholder] por el
   criterio de aceptación de la spec (Modelo de datos). */
export const navItems: NavItem[] = [
  { index: "01", label: "Sobre mí", href: "#sobre-mi" }, // [placeholder]
  { index: "02", label: "Stack", href: "#stack" }, // [placeholder]
  { index: "03", label: "Experiencia", href: "#experiencia" }, // [placeholder]
  { index: "04", label: "Proyectos", href: "#proyectos" }, // [placeholder]
  { index: "05", label: "Servicios", href: "#servicios" }, // [placeholder]
  { index: "06", label: "Blog", href: "#blog" }, // [placeholder]
  { index: "07", label: "Contacto", href: "#contacto" }, // [placeholder]
];


