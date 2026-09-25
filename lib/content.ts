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
  image: string;
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

export type PostPeek = {
  category: string;
  title: string;
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWsxf0NpdttfMh88wqA27BcA2N91szgUCHrXm0WKeZRI-4cY0mia3KjNHoj5WfKN97nogArOTNS7O4DmVND2mcBQYvvk0QOBwQh36oBB5URP8UuHDhTu8ahDv0OVo8VCd2JrKisB3mP4n8qYd1wxi_mxruGck29XArScJg3EdK2nbp7zLmqLHfY6tJMXt_xRYEqGHLm8b8gmfmDvHhQ4X2S7hxqsF9KpufjfAiGy9qhMvS-BuLSob_", // [placeholder]
  },
  {
    index: "02", // [placeholder]
    category: "E-Commerce Editorial", // [placeholder]
    title: "Atelier Solstice", // [placeholder]
    body: "Catálogo interactivo de diseño con checkout headless, microanimaciones cinemáticas y sincronización instantánea de stock global.", // [placeholder]
    tags: ["Next.js", "Shopify Storefront", "Anime.js"], // [placeholder]
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9k4qs3b5soYOUu4rSOx-H3WuHEXUPL7Wk0XVhtTlEYp6x9jsIb7x94iFCMqnmnDyo_GBs-T921DnYJTmH1r9niz9SLQkucAEz3fm6VE1nzqf9TwplpSlltRkWGh5JglSm6EJl31-bnzJv4e-HN-a4rnjh-W_A-EpyZwGtbl01Q7wSO_9qeAt6g8iafxCXXt53qqcmI7xpVxrJVIukRqOTK89Rcx5o70akWbDDfW6Gtz6QIRdoaBmT", // [placeholder]
  },
  {
    index: "03", // [placeholder]
    category: "Automation & AI", // [placeholder]
    title: "Synapse Core", // [placeholder]
    body: "Motor de orquestación de prompts para equipos de operaciones legales, con extracción estructurada de contratos en segundos.", // [placeholder]
    tags: ["Python", "OpenAI API", "FastAPI"], // [placeholder]
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhuloIhMHnCLkNDQCnrfaVmYtN29dTEYagaUBSrbUbJvnSPL_AnyPvheRX6nJxQCZHjKavUSpRuOmVtXsQbkyymURHRt8qSeowMsG7ymYu21SDju-FZJThnhzGONPHyvFklbRDFQrCh0G_FN2qYVvcPnQqbW2wgjpyyTUjpVps3ajRRFmGmTdAJ_S2RPBtEJdNIzo_y_d5t7AN0sMIarYRMLKjzeA8vn4m4uogJqneIVbXA21fDt-U", // [placeholder]
  },
  {
    index: "04", // [placeholder]
    category: "SaaS Enterprise", // [placeholder]
    title: "Vesta Workspace", // [placeholder]
    body: "Suite modular para despachos de arquitectura: control de presupuestos, horas por hito y renders en alta resolución integrados.", // [placeholder]
    tags: ["React", "PostgreSQL", "Docker"], // [placeholder]
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6HyLhe5Cspiyu7361jOmlB_ODIvaP94ak03_XyKwkFOv1-RmxMwm0_Qjkcke_ybdSyZ5stuosh1HGweScCpQ4x_EEKrh_B_v01SR1VG4IrOONK6T8ogIK6M8CiWriIs5JRhm8vCg1UNWmI95vKeW7XRSz6JCHPP1SCYgL_UBQIivQ2eZtrXaB8_6hlLoV5mlbNxFQzEx0V-xwrp6eVajUXE3_ih8TWw2pNjd4n4pHnxF0TA3wMsRY", // [placeholder]
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
    href: "#", // [placeholder]
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

export const postPeeks: PostPeek[] = [
  {
    category: "01 // Dev", // [placeholder]
    title: "Sistemas de diseño dinámicos en CSS puro", // [placeholder]
  },
  {
    category: "03 // IA", // [placeholder]
    title: "Modelos locales en producción con Ollama", // [placeholder]
  },
];

export const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKaearigWhLy1U-xRq1hRmMDKoiTT8JXAe3p8qC9WFn0sffFBNu_k5m7r08bihl9iGjdtHrP8kxhUc7jUlry3j8AgXmasDyFoXE-U6MSYH34hJXFrEE59c0oiU_-wk8u9wkNNYy4IU4QYIs816f7UyKx76IOmKjcggTn1QTpOocWWvRj5tX0Aqh2KoZEcC6qnOG4tIzghm48GuzuuC0IasEOqPGX99rphjTKl-Y8dAeRKAIhq4nfjt"; // [placeholder]

export const portraitImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCCCTrXMpPUglLzlsOZKeAEfVB2gXQyCEpCZqCm6ai0ED5YDTkquWKgHPGogMv2tN7IkYmSPYnEXzeLVip5Sr3sV1yE76ZINbwFcaNckOX87pL3pk0xfXSdkAKuZojGSXIZe1opoIoG0JpKA9wDrNeEIfRpN1OEO-xh0B_Q3UzcogVo5Vpb8a2zK-QQcEFnK5C69kkhyXlINhfNxI8JTB4T4xVzdI3yq2dQPIjZHN6HumS6zezDOV18"; // [placeholder]

export const featuredPostImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1UO2FHCD-wkO_dY6JY0L7R65GCyKN3eEM2gaJO2hd1oAErNKrvfcl2TMbXSgYLrgEBOYMRU1jx56AT2hNSu8auI3NF-_J_gnzUc1dB3ZjIzWbSR8vXCH3ayPavWis5RleyJMsKqFUNRZ7bDmEH3WdmSy1kStlL-7uO7yCJrWlmT7QIenvgf3RhYdvxmBFHh9b72_l-QH-GwHuTuLzbCjdwvu6Hua9FxAi3BcTJ6JQbAZflgxPbUO2"; // [placeholder]
