import { ProtectedSurface } from "@/app/es/auth/protected-surface";
import { SurfaceHeader } from "@/app/es/_components/surface-header";
import { PostEditorPanel } from "@/app/es/blog/editor/post-editor-panel";

export default function PostEditorPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader
          description="Edita, revisa y publica una pieza editorial con cambios locales y preview accesible."
          eyebrow="04 / post editor"
          id="editor-title"
          title="Editor de posts"
        />
        <ProtectedSurface allowedRoles={["admin", "editor"]}>
          <PostEditorPanel />
        </ProtectedSurface>
      </div>
    </main>
  );
}
