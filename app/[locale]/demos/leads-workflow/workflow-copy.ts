"use client";

import { useLocale, type Locale } from "@/app/lib/locale-context";
import { useCallback } from "react";
import { translateDemoText } from "@/app/lib/demo-text";

const english = {
  "Error de inferencia mock en AGENTE_IA. Reinicia o selecciona monitoreo en vivo para reintentar.": "Mock inference failed at AGENTE_IA. Reset or choose live monitoring to retry.",
  "01. EN VIVO // MONITOREO": "01. LIVE // MONITORING", "02. PROCESANDO EVENTO": "02. PROCESSING EVENT", "03. ENRUTAMIENTO CRÍTICO": "03. CRITICAL ROUTING", "04. VISTA MATRIX (DEBUG)": "04. MATRIX VIEW (DEBUG)",
  "EN VIVO // INGESTIÓN TELEMÉTRICA": "LIVE // TELEMETRY INGESTION", "EN VIVO": "LIVE", "PROCESANDO": "PROCESSING", "CRÍTICO": "CRITICAL", "DESPLEGADO": "DEPLOYED", "NUEVO": "NEW", "CUALIFICADO": "QUALIFIED", "ENRUTADO": "ROUTED", "DESCARTADO": "DISCARDED", "Nuevo": "New", "Cualificado": "Qualified", "Enrutado": "Routed", "Descartado": "Discarded",
  "Filtrar por estado / ICP / origen": "Filter by status / ICP / source", "Estado": "Status", "Score ICP mínimo": "Minimum ICP score", "Todos": "All", "Origen": "Source", "[ LIMPIAR FILTROS ]": "[ CLEAR FILTERS ]",
  "Ningún lead coincide con los filtros activos. Limpia los filtros para recuperar el registro.": "No leads match the active filters. Clear filters to restore the registry.", "Ningún lead coincide con los filtros activos.": "No leads match the active filters.", "Detalle de ": "Details for ", "PRESUPUESTO:": "BUDGET:", "MOTIVO:": "REASON:", "{ ESTADO: ": "{ STATUS: ", "Traza de auditoría": "Audit trace", "{ TRAZA DE AUDITORÍA }": "{ AUDIT TRACE }", "EVENTOS": "EVENTS", "{ REGISTRO EN VIVO }": "{ LIVE REGISTRY }", "Trazabilidad auditable de leads procesados, enriquecidos y enrutados por el orquestador.": "Audit trail of leads processed, enriched and routed by the orchestrator.", "Leads procesados": "Processed leads", "{ PROCESADOS HOY: ": "{ PROCESSED TODAY: ", "{ CONVERSIÓN: 28.4% }": "{ CONVERSION: 28.4% }", "{ TIEMPO INFERENCIA MEDIO: 210ms }": "{ AVERAGE INFERENCE TIME: 210ms }", "[ EXPORTAR JSON ]": "[ EXPORT JSON ]",
  "Canvas de orquestación del workflow": "Workflow orchestration canvas", "Reducir zoom": "Zoom out", "Aumentar zoom": "Zoom in", "Workspace mock listo. Selecciona una acción para ejecutar el pipeline.": "Mock workspace ready. Select an action to run the pipeline.", "Test ejecutado: traza determinista disponible en el registro.": "Test completed: deterministic trace available in the registry.", "Disparo simulado: pipeline completado y lead actualizado.": "Trigger simulated: pipeline completed and lead updated.", "Aviso de persistencia: ": "Storage notice: ", "Snapshot local restaurado: ": "Local snapshot restored: ", "La operación mock no pudo completarse.": "The mock operation could not be completed.", "La operación no se completó.": "The operation did not complete.", "Los filtros se muestran en memoria, pero no pudieron persistirse.": "Filters remain active in memory but could not be saved.", "Preset activo: ": "Active preset: ", "Todos los nodos fixture ya están en el canvas.": "All fixture nodes are already on the canvas.", "Nodo fixture añadido en una posición determinista.": "Fixture node added at a deterministic position.", "Grid restaurado: leads, eventos y despliegue se conservaron.": "Grid restored: leads, events and deployment preserved.", "Auto-align aplicado con posiciones deterministas.": "Auto-align applied with deterministic positions.", "Workflow desplegado localmente.": "Workflow deployed locally.", "← Volver al portfolio": "← Back to portfolio", "Navegación de la demo": "Demo navigation", "[ SIMULAR EVENTO ]": "[ SIMULATE EVENT ]", "✦ [ DESPLEGAR FLUJO ]": "✦ [ DEPLOY WORKFLOW ]", "{ LATENCIA P95:": "{ P95 LATENCY:", "{ INGESTA:": "{ INGESTION:", "[ + AÑADIR NODO ]": "[ + ADD NODE ]", "✦ [ SIMULAR DISPARO ]": "✦ [ SIMULATE TRIGGER ]", "[ EJECUTAR TEST ↵ ]": "[ RUN TEST ↵ ]", "Presets del workflow": "Workflow presets", "{ PRESET_ESTADO }:": "{ STATE_PRESET }:", "[ ABRIR REGISTRO (": "[ OPEN REGISTRY (", "Registro lateral de leads": "Lead registry sidebar", "Registro operativo de leads y filtros combinables.": "Operational lead registry and combined filters.", "Registro en vivo": "Live registry",
  "La configuración del workflow no es válida para desplegar.": "Workflow configuration is not valid for deployment.", "El workflow necesita un nombre.": "The workflow needs a name.", "El workflow necesita una revisión.": "The workflow needs a revision.", "Falta el nodo requerido: ": "Required node missing: ", "Falta un nodo de salida del pipeline.": "The pipeline needs an output node.", "El workflow necesita conexiones entre nodos.": "The workflow needs connections between nodes.", "La conexión ": "Connection ", " referencia nodos inexistentes.": " references missing nodes.", " no puede apuntar al mismo nodo.": " cannot target itself.",
  "La persistencia local no está disponible; se usará un fallback en memoria.": "Local storage is unavailable; the workspace continues in memory.", "No se pudo limpiar el snapshot inválido; el fallback en memoria sigue activo.": "The invalid snapshot could not be removed; the in-memory workspace remains active.", "No se pudo leer el snapshot local; se usarán fixtures seguros en memoria.": "The local snapshot could not be read; safe in-memory fixtures are active.", "El snapshot local contiene JSON inválido; se restaurarán fixtures seguros.": "The local snapshot contains invalid JSON; safe fixtures have been restored.", "El snapshot local no coincide con el contrato vigente; se restaurarán fixtures seguros.": "The local snapshot is incompatible; safe fixtures have been restored.", "No se pudo guardar el snapshot local; el workspace continúa en memoria.": "The snapshot could not be saved; the workspace continues in memory.", "El layout guardado contiene colisiones o posiciones inválidas; se ha alineado de forma segura.": "Saved node positions were invalid or overlapping; the layout was safely aligned.",
} satisfies Record<string, string>;

/** Technical identifiers and fixture values are preserved; operational copy is mapped here. */
export function translateWorkflowText(value: string, locale: Locale): string {
  if (locale === "es") return value;
  const direct = english[value as keyof typeof english];
  if (direct) return direct;
  const exact = english[value.trim() as keyof typeof english];
  if (exact) return value.replace(value.trim(), exact);
  const templates: [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^Snapshot local restaurado: (.+)\.$/, (match) => `Local snapshot restored: ${translateWorkflowText(match[1], locale)}.`],
    [/^Falta el nodo requerido: (.+)\.$/, (match) => `Required node missing: ${match[1]}.`],
    [/^La conexión (.+) referencia nodos inexistentes\.$/, (match) => `Connection ${match[1]} references missing nodes.`],
    [/^La conexión (.+) no puede apuntar al mismo nodo\.$/, (match) => `Connection ${match[1]} cannot target itself.`],
  ];
  for (const [pattern, render] of templates) {
    const match = value.match(pattern);
    if (match) return render(match);
  }
  return translateDemoText(english, value);
}

export function useWorkflowText() {
  const locale = useLocale();
  return useCallback((value: string) => translateWorkflowText(value, locale), [locale]);
}
