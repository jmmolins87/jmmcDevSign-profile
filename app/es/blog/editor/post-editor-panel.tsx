"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  CheckboxField,
  InputField,
  Modal,
  StatusIndicator,
  TextareaField,
} from "@/app/components/ui";
import { postRepository, type PostDraft, type PostStatus } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

const statusLabels: Record<PostStatus, string> = {
  draft: "Borrador",
  review: "En revisión",
  published: "Publicado",
};

export function PostEditorPanel() {
  const storedPosts = useMockRepository(postRepository);
  const [post, setPost] = useState<PostDraft | null>(() => storedPosts[0] ?? null);
  const [feedback, setFeedback] = useState("Cambios locales sin guardar.");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function updatePost<Key extends keyof PostDraft>(key: Key, value: PostDraft[Key]) {
    setPost((currentPost) => currentPost ? { ...currentPost, [key]: value } : currentPost);
    setFeedback("Cambios locales sin guardar.");
  }

  async function savePost(status: PostStatus) {
    if (!post) return;

    const updatedPost = await postRepository.update(post.id, { ...post, status });
    setPost(updatedPost);
    setFeedback(`Post guardado como ${statusLabels[status].toLowerCase()}.`);
  }

  if (!post) {
    return <p className="border border-border p-space-lg text-body-md text-on-surface-variant" role="status">No hay posts disponibles para editar.</p>;
  }

  return (
    <div className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div>
            <CardMeta>Post / edición local</CardMeta>
            <CardTitle className="mt-space-sm">Componer publicación</CardTitle>
          </div>
          <Badge variant={post.status === "published" ? "active" : "neutral"}>{statusLabels[post.status]}</Badge>
        </CardHeader>
        <CardContent>
          <form className="grid gap-space-lg" onSubmit={(event) => { event.preventDefault(); savePost("draft"); }}>
            <InputField
              label="Título"
              onChange={(event) => updatePost("title", event.target.value)}
              required
              value={post.title}
            />
            <InputField
              description="Se usa en la URL pública del post."
              label="Slug"
              onChange={(event) => updatePost("slug", event.target.value)}
              required
              value={post.slug}
            />
            <TextareaField
              label="Entradilla"
              onChange={(event) => updatePost("excerpt", event.target.value)}
              required
              value={post.excerpt}
            />
            <TextareaField
              label="Cuerpo"
              onChange={(event) => updatePost("body", event.target.value)}
              required
              value={post.body}
            />
            <CheckboxField
              checked={post.commentsEnabled}
              description="El estado se guarda solo en memoria durante esta demo."
              label="Permitir comentarios mock"
              onChange={(event) => updatePost("commentsEnabled", event.target.checked)}
            />
            <div className="flex flex-wrap gap-space-sm">
              <Button type="submit" variant="secondary">Guardar borrador</Button>
              <Button onClick={() => savePost("review")} type="button" variant="accent">Enviar a revisión</Button>
              <Button onClick={() => savePost("published")} type="button" variant="primary">Publicar mock</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid content-start gap-space-lg">
        <Card>
          <CardContent className="grid gap-space-md">
            <div className="flex items-center justify-between gap-space-md">
              <CardMeta>Estado del documento</CardMeta>
              <StatusIndicator label={statusLabels[post.status].toUpperCase()} status={post.status === "published" ? "active" : "idle"} />
            </div>
            <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
            <Button onClick={() => setIsPreviewOpen(true)} type="button" variant="ghost">Abrir preview</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardMeta>Bloques / documento</CardMeta>
              <CardTitle className="mt-space-sm">Estructura editorial</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-space-sm">
            {["Entradilla", "Contexto", "Criterio técnico", "Cierre"].map((block, index) => (
              <div className="flex items-center justify-between gap-space-md border border-border px-space-md py-space-sm" key={block}>
                <span className="font-headline text-headline-md uppercase text-primary">{block}</span>
                <Badge>{`0${index + 1}`}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal
        description="Vista previa del post con el contenido actual de la demo."
        footer={<Button onClick={() => setIsPreviewOpen(false)} type="button" variant="secondary">Cerrar preview</Button>}
        onClose={() => setIsPreviewOpen(false)}
        open={isPreviewOpen}
        title={post.title}
      >
        <article className="grid gap-space-md">
          <CardMeta>{post.slug}</CardMeta>
          <p className="text-body-lg text-on-surface-variant">{post.excerpt}</p>
          <p className="text-body-md text-on-surface">{post.body}</p>
        </article>
      </Modal>
    </div>
  );
}
