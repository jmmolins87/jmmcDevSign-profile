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
