/* SPEC 04 — Mocks de la demo Agente de leads.
   Datos ficticios de references/02_demo_agente_de_leads/.
   Todo contenido de ejemplo lleva // [placeholder]. */

import type { FeedEvent, Kpi, Lead } from "./types";

export const MOCK_LEADS: Lead[] = [
  {
    id: "elena-vance", // [placeholder]
    name: "Elena Vance", // [placeholder]
    role: "VP Growth", // [placeholder]
    company: "Kinetix Global", // [placeholder]
    channel: "Web", // [placeholder]
    time: "hace 18m", // [placeholder]
    score: 72, // [placeholder]
    column: "nuevo", // [placeholder]
    priority: "media", // [placeholder]
    email: "e.vance@kinetixglobal.io", // [placeholder]
    phone: "+34 600 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Descargó la guía de scoring y visitó precios dos veces esta semana." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "Equipo de growth de 12 personas; stack actual con plan scale." }, // [placeholder]
      { label: "Urgencia:", body: "Media — Evalúan herramienta antes del próximo trimestre." }, // [placeholder]
    ],
    nextStep: "Email de descubrimiento en 4 h (16:30 h)", // [placeholder]
    nextStepBody: "Se incluirá benchmark de cualificación para equipos de growth.", // [placeholder]
    steps: [
      { label: "Email inicial de bienvenida", state: "done", meta: "Completado · hace 20 min" }, // [placeholder]
      { label: "Enriquecimiento de perfil", state: "active", meta: "En curso · ahora mismo" }, // [placeholder]
      { label: "Email de descubrimiento", state: "todo", meta: "Programado · hoy 16:30" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
  {
    id: "guillermo-ruiz", // [placeholder]
    name: "Guillermo Ruiz", // [placeholder]
    role: "Director Operaciones", // [placeholder]
    company: "Vanguard Logística", // [placeholder]
    channel: "Formulario", // [placeholder]
    time: "hace 42m", // [placeholder]
    score: 54, // [placeholder]
    column: "nuevo", // [placeholder]
    priority: "baja", // [placeholder]
    email: "g.ruiz@vanguardlogistica.es", // [placeholder]
    phone: "+34 600 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Formulario genérico de contacto sin caso de uso concreto." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "Sin datos de tamaño de equipo; por verificar." }, // [placeholder]
      { label: "Urgencia:", body: "Baja — Sin ventana temporal declarada." }, // [placeholder]
    ],
    nextStep: "Email de descubrimiento en 24 h", // [placeholder]
    nextStepBody: "Se incluirá cuestionario corto de caso de uso.", // [placeholder]
    steps: [
      { label: "Email inicial de bienvenida", state: "done", meta: "Completado · hace 40 min" }, // [placeholder]
      { label: "Enriquecimiento de perfil", state: "todo", meta: "Programado · hoy" }, // [placeholder]
      { label: "Email de descubrimiento", state: "todo", meta: "Programado · mañana" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
  {
    id: "carlos-mendia", // [placeholder]
    name: "Carlos Mendía", // [placeholder]
    role: "Head of Engineering", // [placeholder]
    company: "Novalabs", // [placeholder]
    channel: "LinkedIn", // [placeholder]
    time: "hace 1h", // [placeholder]
    score: 94, // [placeholder]
    column: "cualificado", // [placeholder]
    priority: "alta", // [placeholder]
    email: "c.mendia@novalabs.io", // [placeholder]
    phone: "+34 621 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Busca automatizar workflows de scoring y sustituir herramientas legacy antes de Q3." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "Empresa Serie B con >40 ingenieros; capacidad estimada >$2,500/mes." }, // [placeholder]
      { label: "Urgencia:", body: "Alta — El contrato con su proveedor anterior finaliza en 3 semanas." }, // [placeholder]
    ],
    nextStep: "Email personalizado en 2 h (14:30 h)", // [placeholder]
    nextStepBody: "Se incluirá caso de estudio de arquitectura distribuida para Novalabs.", // [placeholder]
    steps: [
      { label: "Email inicial de bienvenida", state: "done", meta: "Completado · hace 45 min" }, // [placeholder]
      { label: "Mensaje conexión LinkedIn / WhatsApp", state: "active", meta: "En curso · hace 10 min" }, // [placeholder]
      { label: "Recordatorio automático de agenda", state: "todo", meta: "Programado · mañana 10:00" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
  {
    id: "sara-morales", // [placeholder]
    name: "Sara Morales", // [placeholder]
    role: "Product Lead", // [placeholder]
    company: "Finscale Core", // [placeholder]
    channel: "Web", // [placeholder]
    time: "hace 2h", // [placeholder]
    score: 89, // [placeholder]
    column: "cualificado", // [placeholder]
    priority: "alta", // [placeholder]
    email: "s.morales@finscalecore.io", // [placeholder]
    phone: "+34 600 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Probó la demo interactiva y repitió visita al pricing en 48 h." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "Scale-up fintech con ronda reciente; equipo de producto de 8." }, // [placeholder]
      { label: "Urgencia:", body: "Alta — Quieren piloto antes del cierre de Q2." }, // [placeholder]
    ],
    nextStep: "Email con propuesta de piloto en 3 h", // [placeholder]
    nextStepBody: "Se incluirá alcance de piloto de 14 días para Finscale Core.", // [placeholder]
    steps: [
      { label: "Email inicial de bienvenida", state: "done", meta: "Completado · hace 2 h" }, // [placeholder]
      { label: "Calificación automática 89/100", state: "done", meta: "Completado · hace 1 h" }, // [placeholder]
      { label: "Email con propuesta de piloto", state: "active", meta: "En curso · ahora mismo" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
  {
    id: "javier-ortega", // [placeholder]
    name: "Javier Ortega", // [placeholder]
    role: "CTO", // [placeholder]
    company: "Fintech Corp", // [placeholder]
    channel: "Email Directo", // [placeholder]
    time: "hace 3h", // [placeholder]
    score: 88, // [placeholder]
    column: "seguimiento", // [placeholder]
    priority: "media", // [placeholder]
    email: "j.ortega@fintechcorp.io", // [placeholder]
    phone: "+34 600 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Respondió al email de cualificación pidiendo comparativa técnica." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "CTO con capacidad de firma; ciclo típico de 30 días." }, // [placeholder]
      { label: "Urgencia:", body: "Media — Sin fecha límite, pero con interés activo." }, // [placeholder]
    ],
    nextStep: "Enviar comparativa técnica mañana 09:00", // [placeholder]
    nextStepBody: "Se incluirá matriz frente a su stack actual.", // [placeholder]
    steps: [
      { label: "Email de cualificación enviado", state: "done", meta: "Completado · hace 3 h" }, // [placeholder]
      { label: "Respuesta detectada", state: "done", meta: "Completado · hace 1 h" }, // [placeholder]
      { label: "Comparativa técnica", state: "active", meta: "En curso · ahora mismo" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
  {
    id: "marta-rius", // [placeholder]
    name: "Marta Rius", // [placeholder]
    role: "CPO", // [placeholder]
    company: "SaaSify Labs", // [placeholder]
    channel: "Calendly", // [placeholder]
    time: "hace 4h", // [placeholder]
    score: 91, // [placeholder]
    column: "reunion", // [placeholder]
    priority: "alta", // [placeholder]
    email: "m.rius@saasifylabs.io", // [placeholder]
    phone: "+34 600 ••• •••", // [placeholder]
    signals: [
      { label: "Intención de compra:", body: "Agendó demo de 30 m tras leer el caso de estudio." }, // [placeholder]
      { label: "Señal de presupuesto:", body: "CPO con budget asignado a tooling de revenue." }, // [placeholder]
      { label: "Urgencia:", body: "Alta — Demo confirmada para esta semana." }, // [placeholder]
    ],
    nextStep: "Demo 30 m confirmada · recordatorio 1 h antes", // [placeholder]
    nextStepBody: "Se incluirá agenda personalizada para SaaSify Labs.", // [placeholder]
    steps: [
      { label: "Email inicial de bienvenida", state: "done", meta: "Completado · hace 4 h" }, // [placeholder]
      { label: "Reunión agendada vía Calendly", state: "done", meta: "Completado · hace 2 h" }, // [placeholder]
      { label: "Recordatorio automático de agenda", state: "active", meta: "En curso · ahora mismo" }, // [placeholder]
      { label: "Escalado a llamada humana", state: "todo", meta: "En espera condicional" }, // [placeholder]
    ],
  },
];

export const MOCK_COLUMN_TOTALS: Record<string, number> = {
  nuevo: 14, // [placeholder]
  cualificado: 9, // [placeholder]
  seguimiento: 6, // [placeholder]
  reunion: 3, // [placeholder]
};

export const MOCK_KPIS: Kpi[] = [
  { label: "Leads hoy", value: "48", icon: "group", detail: "+14%", detailSuffix: "vs ayer", detailTone: "teal", barWidth: 70, barTone: "teal" }, // [placeholder]
  { label: "Cualificados", value: "32", icon: "verified", detail: "66.7% ratio", detailTone: "teal", barWidth: 66.7, barTone: "teal" }, // [placeholder]
  { label: "Tasa de respuesta", value: "78.4%", badge: "Automático", detail: "~4.2 min avg", detailTone: "muted", barWidth: 78.4, barTone: "ochre" }, // [placeholder]
  { label: "Reuniones agendadas", value: "12", icon: "calendar_month", detail: "80% meta", detailTone: "accent", barWidth: 80, barTone: "accent" }, // [placeholder]
];

export const MOCK_FEED: FeedEvent[] = [
  { time: "12:44 h", title: "Lead #8491 (S. Morales) calificado 89/100 → Seguimiento", meta: "Regla: High Intent Score" }, // [placeholder]
  { time: "12:41 h", title: "Email de cualificación enviado a Javier Ortega (Fintech Corp)", meta: "Plantilla: B2B Enterprise CTA" }, // [placeholder]
  { time: "12:35 h", title: "Nueva respuesta detectada desde formulario web principal", meta: "Webhook trigger / Payload OK" }, // [placeholder]
  { time: "12:28 h", title: "Reunión confirmada: demo 30m agendada con Marta Rius", meta: "Sync Google Calendar" }, // [placeholder]
];

export const MOCK_FEED_EXTRA: FeedEvent[] = [
  { time: "12:51 h", title: "Lead #8502 (A. Ferrer) cualificado 76/100 → Seguimiento", meta: "Regla: High Intent Score" }, // [placeholder]
  { time: "12:57 h", title: "Respuesta de Elena Vance: pide benchmark de cualificación", meta: "Canal: Email Directo" }, // [placeholder]
  { time: "13:03 h", title: "Recordatorio de agenda enviado a Marta Rius", meta: "Sync Google Calendar" }, // [placeholder]
];
