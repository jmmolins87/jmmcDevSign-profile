/* SPEC 07 — Paso 4: Tabla "Últimas facturas emitidas" con 4 filas + paginación inerte. */

"use client";

import { MOCK_INVOICES, type Invoice } from "@/lib/data/software";

const STATUS_STYLES: Record<Invoice["status"], string> = {
  pagada: "bg-secondary-container/40 text-on-secondary-container",
  pendiente: "bg-tertiary-container/30 text-tertiary",
  vencida: "bg-error-container text-on-error-container",
};

export default function InvoicesTable() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Registro y trazabilidad de los cobros en curso
        </p>
        <a className="font-label-caps text-label-caps tracking-wider text-primary hover:text-primary-container flex items-center gap-1 transition-colors" href="#">
          <span>VER TODAS (142)</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-[11px] tracking-wider">
              <th className="py-2.5 px-3 rounded-l-lg">ID FACTURA</th>
              <th className="py-2.5 px-3">CLIENTE / ENTIDAD</th>
              <th className="py-2.5 px-3">EMISIÓN</th>
              <th className="py-2.5 px-3">VENCE</th>
              <th className="py-2.5 px-3 text-right">IMPORTE</th>
              <th className="py-2.5 px-3 text-center">ESTADO</th>
              <th className="py-2.5 px-2 rounded-r-lg text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high font-mono-code text-[13px]">
            {MOCK_INVOICES.map((invoice: Invoice) => (
              <tr key={invoice.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 px-3 font-semibold text-on-surface">{invoice.id}</td>
                <td className="py-3 px-3 font-body-md text-[14px] text-on-surface">{invoice.client}</td>
                <td className="py-3 px-3 text-on-surface-variant">{invoice.issued}</td>
                <td className={`py-3 px-3 ${invoice.status === "vencida" ? "text-primary font-medium" : "text-on-surface-variant"}`}>
                  {invoice.due}
                </td>
                <td className={`py-3 px-3 text-right font-medium ${invoice.status === "vencida" ? "text-primary" : "text-on-surface"}`}>
                  {invoice.amount}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`font-label-caps text-[10px] px-2.5 py-1 rounded-full ${STATUS_STYLES[invoice.status]}`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors" title="Descargar PDF" type="button">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between text-mono-code text-[12px] text-on-surface-variant">
        <span>Mostrando 4 de 142 registros</span>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-surface-container" disabled type="button">
            <span className="material-symbols-outlined text-[18px] opacity-40">chevron_left</span>
          </button>
          <span className="font-semibold text-on-surface">1</span>
          <button className="p-1 rounded hover:bg-surface-container" type="button">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </>
  );
}