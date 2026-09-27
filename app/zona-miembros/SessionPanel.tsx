"use client";

/* SPEC 10 — Paso 4: panel de sesión activa en /zona-miembros.
   Muestra el email autenticado, acceso al editor y cierre de sesión. */

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getBrowserClient } from "@/lib/supabase/browser";

interface SessionPanelProps {
  email: string;
  onSignedOut: () => void;
}

export default function SessionPanel({ email, onSignedOut }: SessionPanelProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await getBrowserClient().auth.signOut();
      onSignedOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6" data-anim="fade-up" role="status">
      <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">verified_user</span>
        <div className="min-w-0 space-y-1">
          <p className="font-body-sm text-body-sm font-medium leading-snug">
            Sesión iniciada. Tienes acceso al gestor editorial.
          </p>
          <p className="font-mono-code text-[11px] break-all">{email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push("/blog/editor")}
          className="w-full h-12 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group active:scale-[0.99]"
        >
          <span>Ir al editor del blog</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">edit_note</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full py-2.5 text-center text-on-surface-variant hover:text-error transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">logout</span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider group-hover:underline underline-offset-4">
            {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </span>
        </button>
      </div>
    </div>
  );
}
