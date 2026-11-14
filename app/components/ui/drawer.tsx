"use client";

import { useCallback, useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";

import { Button } from "@/app/components/ui/button";

export type DrawerProps = {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  modal?: boolean;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Drawer({
  children,
  closeLabel = "Cerrar panel",
  description,
  modal = true,
  onClose,
  open,
  title,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTargetRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      returnFocusTargetRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }
      dialog.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [modal, open]);

  const restoreFocus = useCallback(() => {
    const target = returnFocusTargetRef.current;
    returnFocusTargetRef.current = null;
    target?.focus();
  }, []);

  const closeDrawer = useCallback(() => {
    restoreFocus();
    onClose();
  }, [onClose, restoreFocus]);

  useEffect(() => {
    if (!open || modal) return;

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
    }

    window.addEventListener("keydown", handleDocumentKeyDown);
    return () => window.removeEventListener("keydown", handleDocumentKeyDown);
  }, [closeDrawer, modal, open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeDrawer();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDrawer();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
    }
  }

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="jmmc-overlay jmmc-drawer border-s border-border bg-surface-container p-0 text-on-surface"
      data-modal={modal ? "true" : "false"}
      tabIndex={-1}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onClose={closeDrawer}
      onKeyDown={handleKeyDown}
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
          <Button aria-label={closeLabel} onClick={closeDrawer} size="sm" variant="ghost">
            ×
          </Button>
        </header>
        <div>{children}</div>
      </div>
    </dialog>
  );
}
