"use client";

import { Button, ErrorState } from "@/app/components/ui";
import { useLocale } from "@/app/lib/locale-context";

export default function PublicPostError({ retry }: { retry: () => void }) {
  const locale = useLocale();
  const spanish = locale === "es";

  return (
    <main className="mx-auto max-w-3xl px-margin py-space-2xl">
      <ErrorState
        action={<Button onClick={retry} variant="secondary">{spanish ? "Reintentar" : "Try again"}</Button>}
        message={spanish ? "Inténtalo de nuevo en unos segundos." : "Try again in a few seconds."}
        title={spanish ? "No se pudo cargar la publicación" : "The publication could not be loaded"}
      />
    </main>
  );
}
