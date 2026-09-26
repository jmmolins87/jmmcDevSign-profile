/* SPEC 03 — Selector de la capa de datos.
   `mock` por defecto; cualquier valor inválido cae a `mock` con aviso.
   `supabase` falla en claro: el backend se cablea en la spec de corte. */

import { MOCK_FEATURED_POST, MOCK_IMAGES, MOCK_POST_PEEKS } from "./mock";
import type { DataSource, Post, PostPeek, SiteImage } from "./types";

export type { DataSource, Post, PostPeek, SiteImage };

export function getDataSource(): DataSource {
  const raw = process.env.DATA_SOURCE;
  if (raw === "supabase") return "supabase";
  if (raw !== undefined && raw !== "mock") {
    console.warn(
      `[data] DATA_SOURCE="${raw}" no válido; se usa "mock". Valores: mock | supabase.`
    );
  }
  return "mock";
}

function assertMock(): void {
  if (getDataSource() === "supabase") {
    throw new Error(
      "[data] DATA_SOURCE=supabase sin backend cableado. La lectura real llega en la spec de corte; usa mock."
    );
  }
}

export function getSiteImage(key: string): SiteImage {
  assertMock();
  const image = MOCK_IMAGES[key];
  if (!image) throw new Error(`[data] Imagen mock desconocida: "${key}".`);
  return image;
}

export function getFeaturedPost(): Post {
  assertMock();
  return MOCK_FEATURED_POST;
}

export function getPostPeeks(): PostPeek[] {
  assertMock();
  return MOCK_POST_PEEKS;
}
