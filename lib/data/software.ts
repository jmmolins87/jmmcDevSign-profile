/* SPEC 07 — Mocks de la demo Software de gestión.
   Datos ficticios de references/04_demo_software_de_gesti_n/.
   Todo contenido de ejemplo lleva // [placeholder]. */

import type { Kpi } from "./types";

export type ChartPoint = {
  week: string;
  facturacion: number;
  cobros: number;
  isHighlight?: boolean;
  tooltip?: {
    label: string;
    cobrados: string;
    facturados: string;
  };
};

export type Invoice = {
  id: string;
  client: string;
  issued: string;
  due: string;
  amount: string;
  status: "pagada" | "pendiente" | "vencida";
};

export type Appointment = {
  time: string;
  title: string;
  client: string;
  type: "meet" | "presencial";
};

export type StockAlert = {
  name: string;
  sku: string;
  current: number;
  min: number;
  unit: string;
  severity: "critical" | "warning"; // critical = rojo, warning = ochre
  actionLabel: string; // "PEDIR A PROVEEDOR" | "REORDENAR"
};

export type SoftwareTab = "resumen" | "clientes" | "facturas" | "inventario" | "ajustes";

export const MOCK_KPIS: Kpi[] = [
  {
    label: "FACTURACIÓN MENSUAL",
    value: "48.250 €",
    detail: "+18.4% vs. mes anterior",
    detailTone: "teal",
    barWidth: 92,
    barTone: "teal",
  }, // [placeholder]
  {
    label: "CLIENTES ACTIVOS",
    value: "342",
    detail: "+12 nuevos este ciclo · Retención 96.8%",
    detailTone: "teal",
    barWidth: 96.8,
    barTone: "teal",
  }, // [placeholder]
  {
    label: "POR COBRAR",
    value: "8.410 €",
    detail: "5 pendientes · 2 vencen hoy · Prom. 14.2 días",
    detailTone: "ochre",
    barWidth: 85,
    barTone: "ochre",
  }, // [placeholder]
  {
    label: "MARGEN OPERATIVO",
    value: "34.6%",
    detail: "+2.1 ptos objetivo fiscal · EBITDA est. 16.710 €",
    detailTone: "accent",
    barWidth: 78,
    barTone: "accent",
  }, // [placeholder]
];

export const MOCK_CHART_DATA: ChartPoint[] = [
  { week: "Sem. 01", facturacion: 12000, cobros: 10000 }, // [placeholder]
  { week: "Sem. 02", facturacion: 14500, cobros: 12000 }, // [placeholder]
  {
    week: "Sem. 03",
    facturacion: 18400,
    cobros: 14820,
    isHighlight: true,
    tooltip: {
      label: "SEM. 03 · HITO",
      cobrados: "14.820 € cobrados",
      facturados: "18.400 € facturados",
    },
  }, // [placeholder]
  { week: "Sem. 04", facturacion: 16200, cobros: 15200 }, // [placeholder]
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "#INV-2026-089",
    client: "Vanguard Studio S.L.",
    issued: "12 May 2026",
    due: "26 May 2026",
    amount: "4.850,00 €",
    status: "pagada",
  }, // [placeholder]
  {
    id: "#INV-2026-088",
    client: "Kinetix Labs Inc.",
    issued: "10 May 2026",
    due: "24 May 2026",
    amount: "2.200,00 €",
    status: "pendiente",
  }, // [placeholder]
  {
    id: "#INV-2026-087",
    client: "Solaria Energy Group",
    issued: "28 Abr 2026",
    due: "12 May 2026",
    amount: "1.360,00 €",
    status: "vencida",
  }, // [placeholder]
  {
    id: "#INV-2026-086",
    client: "Artemis Ventures",
    issued: "25 Abr 2026",
    due: "09 May 2026",
    amount: "6.400,00 €",
    status: "pagada",
  }, // [placeholder]
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    time: "10:30",
    title: "Revisión fiscal trimestral",
    client: "Vanguard Studio S.L.",
    type: "meet",
  }, // [placeholder]
  {
    time: "12:00",
    title: "Demo nueva plataforma ERP",
    client: "Kinetix Labs Inc.",
    type: "meet",
  }, // [placeholder]
  {
    time: "16:15",
    title: "Firma anexo de contratación",
    client: "Solaria Energy Group",
    type: "presencial",
  }, // [placeholder]
  {
    time: "17:30",
    title: "Briefing arquitectura SaaS",
    client: "Artemis Ventures",
    type: "meet",
  }, // [placeholder]
];

export const MOCK_STOCK_ALERTS: StockAlert[] = [
  {
    name: "Servidor Rack Edge-4U",
    sku: "SKU-SRV-901",
    current: 1,
    min: 10,
    unit: "uds",
    severity: "critical",
    actionLabel: "PEDIR A PROVEEDOR",
  }, // [placeholder]
  {
    name: "Módulo Transceptor SFP+ 10G",
    sku: "SKU-OPT-104",
    current: 3,
    min: 25,
    unit: "uds",
    severity: "warning",
    actionLabel: "REORDENAR",
  }, // [placeholder]
  {
    name: "Llaves FIDO2 de Seguridad Cripto",
    sku: "SKU-KEY-442",
    current: 2,
    min: 30,
    unit: "uds",
    severity: "critical",
    actionLabel: "PEDIR A PROVEEDOR",
  }, // [placeholder]
];

export const TABS: { id: SoftwareTab; label: string; count?: string }[] = [
  { id: "resumen", label: "RESUMEN" },
  { id: "clientes", label: "CLIENTES", count: "1.240" },
  { id: "facturas", label: "FACTURAS", count: "38" },
  { id: "inventario", label: "INVENTARIO", count: "4" },
  { id: "ajustes", label: "AJUSTES" },
];