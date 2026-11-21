import { Suspense } from "react";
import { notFound } from "next/navigation";

import { SHARED_SURFACE_ROLES } from "@/app/[locale]/auth/roles";
import { ProtectedSurface } from "@/app/[locale]/auth/protected-surface";
import { SurfaceHeader } from "@/app/[locale]/_components/surface-header";
import {
  cancelEditorialSchedule,
  createEditorialPost,
  loadEditorialCatalog,
  publishEditorialPost,
  removeEditorialPost,
  saveEditorialPost,
} from "@/app/[locale]/blog/editor/actions";
import { PostEditorPanel } from "@/app/[locale]/blog/editor/post-editor-panel";
import { createSupabasePostRepository } from "@/app/[locale]/blog/repositories/supabase-post-repository";
import { LoadingState } from "@/app/components/ui";
import { isLocale } from "@/app/lib/i18n";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getEditorialAccess } from "@/app/lib/supabase/session";

const operations = {
  cancel: cancelEditorialSchedule,
  create: createEditorialPost,
  list: loadEditorialCatalog,
  publish: publishEditorialPost,
  remove: removeEditorialPost,
  save: saveEditorialPost,
};

async function EditorialWorkspace() {
  const client = await createServerSupabaseClient();
  const access = await getEditorialAccess(client);

  if (access.status !== "active") {
    return <ProtectedSurface access={access} allowedRoles={SHARED_SURFACE_ROLES}>{null}</ProtectedSurface>;
  }

  let catalog = null;
  try {
    catalog = await createSupabasePostRepository(client).list();
  } catch {
    console.error("Editorial catalog lookup failed");
  }

  return <PostEditorPanel initialCatalog={catalog} operations={operations} role={access.role} />;
}

export default async function PostEditorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface px-margin py-space-xl sm:px-margin-tablet lg:px-margin-desktop lg:py-space-2xl">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader
          description={locale === "es" ? "Edita revisiones privadas y elige cuándo publicar." : "Edit private revisions and choose when to publish."}
          eyebrow="04 / editor de publicaciones"
          id="editor-title"
          title={locale === "es" ? "Editor de publicaciones" : "Post editor"}
        />
        <Suspense fallback={<LoadingState label={locale === "es" ? "Cargando editor" : "Loading editor"} />}>
          <EditorialWorkspace />
        </Suspense>
      </div>
    </main>
  );
}
