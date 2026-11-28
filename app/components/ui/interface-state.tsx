import { useId, type ReactNode } from "react";

import styles from "./loading-logo.module.css";

export function LoadingState({ label = "Cargando datos", variant = "inline" }: { label?: string; variant?: "inline" | "page" }) {
  const page = variant === "page";

  return (
    <div
      className={`flex items-center text-body-md text-on-surface-variant ${page ? "flex-col gap-space-sm text-center" : "gap-space-sm py-space-lg"}`}
      role="status"
    >
      <span aria-hidden="true" className={`${styles.logo}${page ? ` ${styles.page}` : ""}`} data-loading-logo>
        <span className={styles.leftBrace} />
        <span className={styles.monogram} />
        <span className={styles.star} />
        <span className={styles.rightBrace} />
      </span>
      <span>{label}</span>
    </div>
  );
}

export type EmptyStateProps = {
  action?: ReactNode;
  message: string;
  title: string;
};

export function EmptyState({ action, message, title }: EmptyStateProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="grid gap-space-md border border-border p-space-lg">
      <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">{/* taste-skill-ignore: technical state token from DESIGN.md */}Estado / vacío</p>
      <h2 className="font-headline text-headline-md uppercase text-primary" id={titleId}>{title}</h2>
      <p className="text-body-md text-on-surface-variant">{message}</p>
      {action}
    </section>
  );
}

export type ErrorStateProps = {
  action?: ReactNode;
  message: string;
  title?: string;
};

export function ErrorState({ action, message, title = "No se pudo completar la operación" }: ErrorStateProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="grid gap-space-md border border-error p-space-lg" role="alert">
      <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-error">{/* taste-skill-ignore: technical state token from DESIGN.md */}Estado / error</p>
      <h2 className="font-headline text-headline-md uppercase text-primary" id={titleId}>{title}</h2>
      <p className="text-body-md text-on-surface-variant">{message}</p>
      {action}
    </section>
  );
}
