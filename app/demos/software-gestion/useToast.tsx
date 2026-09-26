/* SPEC 07 — Toast simple para interacciones [placeholder]. */

"use client";

import { useState, useCallback } from "react";

type Toast = { id: number; message: string };

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, showToast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-on-surface text-surface px-4 py-2 rounded-lg shadow-lg font-mono-code text-[12px] animate-fade-up pointer-events-auto"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}