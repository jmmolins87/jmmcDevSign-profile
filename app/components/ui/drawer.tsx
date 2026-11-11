"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";

import { Button } from "@/app/components/ui/button";

export type DrawerProps = {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Drawer({
  children,
  closeLabel = "Cerrar panel",
  description,
  onClose,
  open,
  title,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="jmmc-overlay jmmc-drawer border-s border-border bg-surface-container p-0 text-on-surface"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="grid min-h-full content-start gap-space-lg p-space-lg">
        <header className="flex items-start justify-between gap-space-lg border-b border-border pb-space-md">{/* taste-skill-ignore: overlay header rule from DESIGN.md */}
          <div className="grid gap-space-xs">
            <h2 className="font-headline text-headline-md uppercase text-primary" id={titleId}>
              {title}
            </h2>
            {description ? <p className="text-body-sm text-on-surface-variant" id={descriptionId}>{description}</p> : null}
          </div>
          <Button aria-label={closeLabel} onClick={onClose} size="sm" variant="ghost">
            ×
          </Button>
        </header>
        <div>{children}</div>
      </div>
    </dialog>
  );
}
