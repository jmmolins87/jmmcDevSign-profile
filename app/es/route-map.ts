export const portfolioRoutes = {
  landing: {
    href: "/es/",
    label: "Portfolio",
    title: "Presentación",
    eyebrow: "01 / 09",
    description: "Landing editorial para presentar la arquitectura de JMMC.",
    section: "portfolio",
  },
  login: {
    href: "/es/login",
    label: "Acceso",
    title: "Autenticación",
    eyebrow: "02 / 09",
    description: "Punto de entrada para la sesión mock y sus roles.",
    section: "portfolio",
  },
  approval: {
    href: "/es/admin/approval",
    label: "Aprobaciones",
    title: "Aprobación de accesos",
    eyebrow: "03 / 09",
    description: "Superficie administrativa para revisar solicitudes.",
    section: "admin",
  },
  editor: {
    href: "/es/blog/editor",
    label: "Editor",
    title: "Editor de publicaciones",
    eyebrow: "04 / 09",
    description: "Espacio de edición para contenidos editoriales.",
    section: "content",
  },
  agentBuilder: {
    href: "/es/demos/agent-builder",
    label: "Constructor de agentes",
    title: "Constructor de agentes",
    eyebrow: "05 / 09",
    description: "Demo de configuración y composición de agentes.",
    section: "demo",
  },
  leadsWorkflow: {
    href: "/es/demos/leads-workflow",
    label: "Flujo de leads",
    title: "Flujo de leads",
    eyebrow: "06 / 09",
    description: "Demo de estados y transiciones para leads.",
    section: "demo",
  },
  leadQualification: {
    href: "/es/demos/lead-qualification",
    label: "Cualificación de leads",
    title: "Cualificación de leads",
    eyebrow: "07 / 09",
    description: "Demo de evaluación y priorización comercial.",
    section: "demo",
  },
  ordersRealtime: {
    href: "/es/demos/orders-realtime",
    label: "Pedidos en tiempo real",
    title: "Pedidos en tiempo real",
    eyebrow: "08 / 09",
    description: "Demo de pedidos y eventos de operación.",
    section: "demo",
  },
  businessBackoffice: {
    href: "/es/demos/business-backoffice",
    label: "Gestión empresarial",
    title: "Gestión empresarial",
    eyebrow: "09 / 09",
    description: "Demo de métricas y operaciones comerciales.",
    section: "demo",
  },
} as const;

export type PortfolioRouteKey = keyof typeof portfolioRoutes;
export type PortfolioRoute = (typeof portfolioRoutes)[PortfolioRouteKey];

export const portfolioRouteList = Object.values(portfolioRoutes);
export const demoRouteList = portfolioRouteList.filter(
  (route) => route.section === "demo",
);

export const demosIndexRoute = {
  href: "/es/demos",
  label: "Demos",
  title: "Catálogo de demos",
  eyebrow: "REGISTRO DE DEMOS",
  description: "Colección de superficies funcionales con datos locales mock.",
} as const;
