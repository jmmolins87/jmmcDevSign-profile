"use client";

import { useLocale } from "@/app/lib/locale-context";
import { translateDemoText } from "@/app/lib/demo-text";
import type { Locale } from "@/app/lib/i18n";

const english = {
  "TOTAL TICKET:": "TICKET TOTAL:",
  "← VOLVER A LAS DEMOS": "← BACK TO DEMOS",
  "Estado de conexión": "Connection status",
  "Pedidos en tiempo real": "Realtime orders",
  "{ PEDIDOS HOY }": "{ ORDERS TODAY }",
  "+14% vs ayer": "+14% vs yesterday",
  "{ TIEMPO MEDIO PREPARACIÓN }": "{ AVERAGE PREPARATION TIME }",
  "(Meta: < 10m) [OK]": "(Target: < 10m) [OK]",
  "{ TICKET MEDIO }": "{ AVERAGE TICKET }",
  "Margen 68%": "Margin 68%",
  "{ VENTAS EN VIVO }": "{ LIVE SALES }",
  "Tendencia de ventas": "Sales trend",
  "12:00 PEAK 14:15 AHORA": "12:00 PEAK 14:15 NOW",
  "Vista móvil de pedidos": "Mobile orders view",
  "{ CLIENTE } // ORDEN": "{ CUSTOMER } // ORDER",
  "{ COCINA } // KDS": "{ KITCHEN } // KDS",
  "{ CLIENTE }": "{ CUSTOMER }",
  "ORDEN ACTIVA //": "ACTIVE ORDER //",
  "MESA INTERNA 03": "INTERNAL TABLE 03",
  "ESTADO EN TIEMPO REAL:": "REALTIME STATUS:",
  "1. RECIBIDO": "1. RECEIVED",
  "2. COCINANDO": "2. COOKING",
  "3. LISTO": "3. READY",
  "EMULAR EVENTO:": "EMULATE EVENT:",
  "→ LISTO": "→ READY",
  "→ PLANCHA": "→ COOKING",
  "→ NUEVO": "→ NEW",
  "// SELECCIÓN DE PRODUCTOS": "// PRODUCT SELECTION",
  "CANT / TOTAL": "QTY / TOTAL",
  "/ ud": "/ unit",
  "IMPUESTOS (IVA 10%)": "TAX (VAT 10%)",
  "TOTAL A PAGAR": "TOTAL TO PAY",
  "✦ ENVIAR PEDIDO [ PEDIR ↵ ]": "✦ SEND ORDER [ ORDER ↵ ]",
  "{ COCINA }": "{ KITCHEN }",
  "ESTACIÓN ACTIVA:": "ACTIVE STATION:",
  "LINEA CENTRAL // BRUTAL_GRILL": "CENTRAL LINE // BRUTAL_GRILL",
  "TODAS": "ALL",
  "PARRILLA": "GRILL",
  "ENSAMBLE": "ASSEMBLY",
  "♧ ALERTAS: ON": "♧ ALERTS: ON",
  "{ NUEVO }": "{ NEW }",
  "{ EN PLANCHA }": "{ COOKING }",
  "{ LISTO RECOGIDA }": "{ READY FOR PICKUP }",
  "{ ENTREGADO }": "{ DELIVERED }",
  "✦ { EVENTOS }": "✦ { EVENTS }",
  "// PROTOCOLO WEBSOCKET EN VIVO": "// LIVE WEBSOCKET PROTOCOL",
  "LIMPIAR BUFFER": "CLEAR BUFFER",
  "FILTRAR POR ID": "FILTER BY ID",
  "Aviso de persistencia:": "Persistence notice:",
  "BUFFER VACÍO // NO HAY FRAMES QUE MOSTRAR": "EMPTY BUFFER // NO FRAMES TO DISPLAY",
  "{ CONECTADO // WSS://STREAM.BURGER.DEV }": "{ CONNECTED // WSS://STREAM.BURGER.DEV }",
  "{ RECONECTANDO // WSS://STREAM.BURGER.DEV }": "{ RECONNECTING // WSS://STREAM.BURGER.DEV }",
  "[ 01. EN VIVO (SINCRONIZADO) ]": "[ 01. LIVE (SYNCHRONIZED) ]",
  "[ 02. NUEVO PEDIDO ENTRANTE (✦) ]": "[ 02. NEW INCOMING ORDER (✦) ]",
  "[ 03. COCINA EN HORA PUNTA ]": "[ 03. KITCHEN RUSH HOUR ]",
  "[ 04. LATENCIA ALTA (RECONECTANDO) ]": "[ 04. HIGH LATENCY (RECONNECTING) ]",
  "{ CONECTADO }": "{ CONNECTED }",
  "RECONECTANDO": "RECONNECTING",
  "CONFIRMADO": "CONFIRMED",
  "PREPARANDO TU PEDIDO": "PREPARING YOUR ORDER",
  "¡LISTO PARA RECOGER!": "READY FOR PICKUP!",
  "COMENZAR A COCINAR →": "START COOKING →",
  "A PLANCHA →": "START GRILLING →",
  "MARCAR LISTO →": "MARK READY →",
  "ENTREGAR ✓": "DELIVER ✓",
  "ARCHIVAR": "ARCHIVE",
  "Canal de tiempo real conectado. Workspace mock preparado.": "Realtime channel connected. Mock workspace ready.",
  "No hay un pedido activo para reproducir.": "There is no active order to play back.",
  "No se pudo hidratar el snapshot; se mantiene el fixture seguro en memoria.": "The snapshot could not be restored; safe fixtures remain in memory.",
  "La operación no pudo completarse en el runtime mock.": "The action could not be completed in the mock runtime.",
  "No se pudo emitir el pedido mock.": "The mock order could not be sent.",
  "STREAM REANUDADO // BUFFER ACTIVO": "STREAM RESUMED // BUFFER ACTIVE",
  "STREAM PAUSADO // LOS EVENTOS AUTOMÁTICOS ESPERAN": "STREAM PAUSED // AUTOMATIC EVENTS WAIT",
  "BUFFER REINICIADO // 0 FRAMES": "BUFFER RESET // 0 FRAMES",
  "Filtrar stream por ID": "Filter stream by ID",
  "FILTRO LIMPIO // TODOS LOS FRAMES": "FILTER CLEARED // ALL FRAMES",
  "REANUDAR STREAM [ ▶ ]": "RESUME STREAM [ ▶ ]",
  "PAUSAR STREAM [ || ]": "PAUSE STREAM [ || ]",
  "Pedido entrante · NUEVO": "Incoming order · NEW",
  "Preparar · EN PLANCHA": "Prepare · COOKING",
  "Finalizar · LISTO": "Finish · READY",
  "Entregar · ENTREGADO": "Deliver · DELIVERED",
  "Segundo pedido · NUEVO": "Second order · NEW",
  "El producto no pertenece al catálogo local.": "The product is not in the local catalog.",
  "El cambio de cantidad debe ser un entero.": "The quantity change must be an integer.",
  "El estado del cliente no es válido.": "The customer status is invalid.",
  "El estado de conexión no es válido.": "The connection status is invalid.",
  "El escenario no es válido.": "The scenario is invalid."
} as const;

type CopyKey = keyof typeof english;
const spanish = Object.fromEntries(Object.keys(english).map((key) => [key, key])) as Record<CopyKey, string>;
const dictionaries: Record<Locale, Record<CopyKey, string>> = { es: spanish, en: english };

/** Fixtures remain domain data; operational labels use the bilingual catalog. */
export function useOrdersText() {
  const locale = useLocale();
  return (value: string): string => {
    if (locale === "es") return value;
    if (Object.hasOwn(dictionaries.en, value)) return dictionaries.en[value as CopyKey];
    return translateDemoText(dictionaries.en, value);
  };
}

