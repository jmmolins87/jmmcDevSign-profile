-- SPEC 10 — Esquema v2 del backend (extiende la SPEC 03).
-- Tablas del contenido: imágenes, posts base, traducciones y profiles.
-- RLS y policies van en el paso 3 del plan; seed de datos en pasos posteriores.

-- images: medios del sitio (Supabase Storage o hotlink de fallback)
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  storage_path text,
  url text not null,
  alt text not null default '',
  width int,
  height int,
  created_at timestamptz not null default now()
);

-- posts: base compartida entre idiomas (sin textos)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug_base text not null unique,
  category text not null default '',
  cover_image_id uuid references public.images (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- post_translations: un registro por post + locale
create table if not exists public.post_translations (
  post_id uuid not null references public.posts (id) on delete cascade,
  locale text not null check (locale in ('es', 'en')),
  title text not null default '',
  excerpt text not null default '',
  body text not null default '',
  reading_minutes int not null default 1,
  primary key (post_id, locale)
);

-- profiles: usuarios autenticados con rol
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'author' check (role in ('admin', 'author')),
  created_at timestamptz not null default now()
);

-- Índices de lectura habitual
create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists post_translations_locale_idx
  on public.post_translations (locale);

-- Bucket público de Storage para las imágenes del sitio
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;
