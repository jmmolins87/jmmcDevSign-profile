/* SPEC 03 — Tipos de la capa de datos. Espejan las tablas
   `posts` e `images` de supabase/schema.sql. */

export type SiteImage = {
  key: string;
  url: string;
  alt: string;
};

export type Post = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  publishedAt: string;
  cover: SiteImage;
};

export type PostPeek = Pick<Post, "slug" | "category" | "title">;

export type DataSource = "mock" | "supabase";

export type LeadColumn = "nuevo" | "cualificado" | "seguimiento" | "reunion";

export type LeadSignal = {
  label: string;
  body: string;
};

export type AgentStep = {
  label: string;
  state: "done" | "active" | "todo";
  meta: string;
};

export type Lead = {
  id: string;
  name: string;
  role: string;
  company: string;
  channel: string;
  time: string;
  score: number;
  column: LeadColumn;
  priority: "alta" | "media" | "baja";
  email: string;
  phone: string;
  signals: LeadSignal[];
  nextStep: string;
  nextStepBody: string;
  steps: AgentStep[];
};

export type Kpi = {
  label: string;
  value: string;
  icon?: string;
  badge?: string;
  detail: string;
  detailSuffix?: string;
  detailTone: "teal" | "muted" | "accent";
  barWidth: number;
  barTone: "teal" | "ochre" | "accent";
};

export type FeedEvent = {
  time: string;
  title: string;
  meta: string;
};

export type AgentSetting = {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
};

/* SPEC 06 — Demo Pedidos en tiempo real. */

export type OrderColumn = "nuevo" | "preparacion" | "listo";

export type OrderChannel = "web-directa" | "take-away" | "delivery";

export type OrderItem = { qty: number; name: string; price: number };

export type Order = {
  id: string;
  guest: string;
  channel: OrderChannel;
  place: string;
  delivery: string;
  issuedAt: string;
  ageLabel: string;
  column: OrderColumn;
  badge: string;
  phone: string;
  note?: string;
  items: OrderItem[];
};
