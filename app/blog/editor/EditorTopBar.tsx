"use client";

/* SPEC 10 — Paso 9: sub-barra superior del editor conectada.
   Botones funcionales: Guardar, Publicar; estado real draft/published; sync tick real. */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { useDict, useI18n } from "@/lib/i18n/I18nProvider";

/* eslint-disable react-hooks/exhaustive-deps -- sync tick basado en savedAt es patrón legítimo */
/* eslint-disable react-hooks/set-state-in-effect -- sync tick basado en savedAt es patrón legítimo */

interface EditorTopBarProps {
  status: "draft" | "published";
  savedAt: Date | null;
  saving: boolean;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  slug: string;
  postId: string | null;
}

export default function EditorTopBar({
  status,
  savedAt,
  saving,
  onSave,
  onPublish,
  slug,
  postId,
}: EditorTopBarProps) {
  const { withLocale } = useI18n();
  const topbar = useDict().sections.editor.topbar;
  const [savedAgo, setSavedAgo] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync tick basado en savedAt es patrón legítimo
    if (!savedAt) {
      setSavedAgo(0);
      return;
    }
    const update = () => setSavedAgo(Math.floor((Date.now() - savedAt.getTime()) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  const handleSave = useCallback(async () => {
    await onSave();
  }, [onSave]);

  const handlePublish = useCallback(async () => {
    await onPublish();
  }, [onPublish]);

  const isPublished = status === "published";
  const badgeLabel = isPublished ? "Publicado" : topbar.draft;
  const badgeDotColor = isPublished ? "bg-secondary" : "bg-tertiary";

  return (
    <>
      {/* Barra de contexto del portafolio */}
      <div className="w-full border-t border-outline-variant/60 bg-surface-container-low/80 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin h-10 flex items-center justify-between">
          <Link
            className="inline-flex items-center font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors"
            href={withLocale("/")}
          >
            {topbar.backToPortfolio}
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {topbar.restrictedBadge}
          </span>
        </div>
      </div>

      <div className="w-full bg-surface-container-low/90 backdrop-blur-md px-margin-mobile lg:px-margin py-3.5" data-anim="fade-up">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: back link + status badge + sync tick */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              className="inline-flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors group"
              href={withLocale("/blog")}
            >
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>{topbar.backToBlog}</span>
            </Link>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            {/* Status badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface">
              <span className={`w-1.5 h-1.5 rounded-full ${badgeDotColor}`} />
              {badgeLabel}
            </span>
            {/* Sync tick */}
            <div className="inline-flex items-center gap-1.5 font-mono-code text-mono-code text-on-surface-variant">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              <span>
                {savedAt
                  ? `${topbar.savedPrefix} ${savedAgo}s ${topbar.savedSuffix}`
                  : topbar.neverSaved}
              </span>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps shadow-sm hover:bg-surface-container transition-all"
              type="button"
              disabled={saving}
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>{topbar.preview}</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-caps text-label-caps shadow-sm hover:bg-surface-container transition-all"
              type="button"
              disabled={saving}
              onClick={handleSave}
            >
              <span className="material-symbols-outlined text-[16px]">{saving ? "hourglass_empty" : "save"}</span>
              <span>{saving ? topbar.saving : topbar.save}</span>
            </button>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-on-primary font-label-caps text-label-caps shadow-sm hover:bg-primary-container transition-all group"
              type="button"
              disabled={saving}
              onClick={handlePublish}
            >
              <span>{isPublished ? topbar.published : topbar.publish}</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}