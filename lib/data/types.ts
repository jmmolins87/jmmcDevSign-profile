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
  detail: string;
  tone: "teal" | "ochre" | "accent";
  badge?: string;
};

export type FeedEvent = {
  time: string;
  title: string;
  meta: string;
};
