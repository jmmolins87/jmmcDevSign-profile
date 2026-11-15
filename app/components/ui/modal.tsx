"use client";

import { useCallback, useEffect, useId, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";

import { Button } from "@/app/components/ui/button";

export type ModalProps = {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Modal({
  children,
  closeLabel = "Cerrar modal",
  description,
  footer,
  onClose,
  open,
  title,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTargetRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const restoreFocus = useCallback(() => {
    const target = returnFocusTargetRef.current;
    returnFocusTargetRef.current = null;
    target?.focus();
  }, []);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => () => restoreFocus(), [restoreFocus]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusTargetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      restoreFocus();
    }
  }, [open, restoreFocus]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeModal();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="jmmc-overlay max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden border border-border bg-surface-container p-0 text-on-surface"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onClose={restoreFocus}
      ref={dialogRef}
    >
      <div className="grid min-w-0 grid-cols-1 max-h-[90dvh] gap-space-lg overflow-y-auto overscroll-contain p-space-lg">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-space-lg border-b border-border bg-surface-container pb-space-md">{/* taste-skill-ignore: overlay header rule from DESIGN.md */}
          <div className="grid gap-space-xs">
            <h2 className="font-headline text-headline-md uppercase text-primary" id={titleId}>
              {title}
            </h2>
            {description ? <p className="text-body-sm text-on-surface-variant" id={descriptionId}>{description}</p> : null}
          </div>
          <Button aria-label={closeLabel} onClick={closeModal} size="sm" variant="ghost">
            ×
          </Button>
        </header>
        <div>{children}</div>
        {footer ? <footer className="border-t border-border pt-space-md">{/* taste-skill-ignore: overlay footer rule from DESIGN.md */}{footer}</footer> : null}
      </div>
    </dialog>
  );
}
