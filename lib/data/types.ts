/* SPEC 03 — Tipos de la capa de datos. Espejan las tablas
   `posts`, `post_translations` e `images` de supabase/schema.sql.
   SPEC 10 paso 7: `Post` pasa al modelo bilingüe (base + traducciones). */

import type { Locale } from "@/lib/i18n/config";

export type { Locale };

export type SiteImage = {
  key: string;
  url: string;
  alt: string;
};

export type PostTranslation = {
  locale: Locale;
  title: string;
  excerpt: string;
  body: string;
  readingMinutes: number;
};

export type Post = {
  slugBase: string;
  category: string;
  status: "draft" | "published";
  publishedAt: string;
  cover: SiteImage;
  translations: Partial<Record<Locale, PostTranslation>>;
};

/* Post resuelto para un locale concreto: textos ya elegidos (con
   fallback a ES) y slug listo para la URL (`base` o `base-en`). */
export type ResolvedPost = {
  slug: string;
  slugBase: string;
  category: string;
  status: "draft" | "published";
  publishedAt: string;
  cover: SiteImage;
  title: string;
  excerpt: string;
  body: string;
  readingMinutes: number;
  fallback: boolean; // true: se muestra ES en contexto EN (sin traducción)
  available: Locale[]; // locales con traducción en BD (para hreflang)
};

export type PostPeek = Pick<ResolvedPost, "slug" | "category" | "title">;

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
  detailTone: "teal" | "muted" | "accent" | "ochre";
  barWidth: number;
  barTone: "teal" | "ochre" | "accent" | "muted";
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
