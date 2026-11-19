/** Only complete catalog entries and explicit runtime message templates are translated.
 * Unknown values remain data, so fixture names and technical identifiers are preserved. */
export function translateDemoText(catalog: Readonly<Record<string, string>>, value: string): string {
  if (Object.hasOwn(catalog, value)) return catalog[value];
  if (Object.hasOwn(runtimeMessages, value)) return runtimeMessages[value as keyof typeof runtimeMessages];
  const wrappers: readonly [RegExp, (inner: string) => string][] = [
    [/^Aviso de persistencia: (.*)$/, (inner) => `Persistence notice: ${translateDemoText(catalog, inner)}`],
    [/^Preset activo: (.*)\.$/, (inner) => `Active preset: ${translateDemoText(catalog, inner)}.`],
    [/^Filtro activo: (.*)\.$/, (inner) => `Active filter: ${translateDemoText(catalog, inner)}.`],
    [/^Estado del cliente: (.*)\.$/, (inner) => `Customer status: ${translateDemoText(catalog, inner)}.`],
    [/^Progreso: (.*)$/, (inner) => `Progress: ${translateDemoText(catalog, inner)}`],
  ];
  for (const [pattern, format] of wrappers) {
    const match = value.match(pattern);
    if (match) return format(match[1]);
  }
  // Validation can return several complete messages joined by a space.
  const sentences = value.match(/[^.]+\.(?:\s|$)/g);
  if (sentences && sentences.length > 1 && sentences.join("").trim() === value.trim()) {
    return sentences.map((sentence) => translateDemoText(catalog, sentence.trim())).join(" ");
  }
  const identifierPatterns: readonly [RegExp, string][] = [
    [/^Pedido no encontrado: (.*)$/, "Order not found: $1"],
    [/^Cliente no encontrado: (.*)$/, "Customer not found: $1"],
    [/^Factura no encontrada: (.*)$/, "Invoice not found: $1"],
    [/^SKU no encontrado: (.*)$/, "SKU not found: $1"],
    [/^Evento duplicado: (.*)$/, "Duplicate event: $1"],
    [/^Acción bloqueada: el rol (.*) no tiene permiso para (.*)\.$/, "Action blocked: role $1 has no permission for $2."],
  ];
  for (const [pattern, replacement] of identifierPatterns) {
    if (pattern.test(value)) return value.replace(pattern, replacement);
  }
  const patterns: readonly [RegExp, string][] = [
    [/^NUEVO LEAD ENTRANTE: (.*)$/, "NEW INCOMING LEAD: $1"],
    [/^Despacho mock aprobado para (.*)\.$/, "Mock dispatch approved for $1."],
    [/^Secuencia reanudada para (.*)\.$/, "Sequence resumed for $1."],
    [/^Secuencia pausada para (.*)\.$/, "Sequence paused for $1."],
    [/^Lead reasignado a (.*)\.$/, "Lead reassigned to $1."],
    [/^Respuesta mock actualizada para (.*)\.$/, "Mock response updated for $1."],
    [/^Reasignar (.*)$/, "Reassign $1"],
    [/^Editar respuesta para (.*)$/, "Edit response for $1"],
    [/^Filtro activo: todos los leads\.$/, "Active filter: all leads."],
    [/^Filtro activo: (.*)\.$/, "Active filter: $1."],
    [/^Preset activo: (.*)\.$/, "Active preset: $1."],
    [/^(\d+)% DEL REGISTRO$/, "$1% OF RECORDS"],
    [/^Pedido (.*) emitido: evento recibido en NUEVO\.$/, "Order $1 sent: event received in NEW."],
    [/^(.*): evento recibido, estado en plancha\.$/, "$1: event received, status cooking."],
    [/^(.*): evento recibido, estado listo\.$/, "$1: event received, status ready."],
    [/^(.*): evento recibido, pedido actualizado\.$/, "$1: event received, order updated."],
    [/^(.*): EN PLANCHA\.$/, "$1: COOKING."],
    [/^(.*): LISTO\.$/, "$1: READY."],
    [/^(.*): ENTREGADO\.$/, "$1: DELIVERED."],
    [/^Carrito actualizado: (.*)\.$/, "Cart updated: $1."],
    [/^Estado del cliente: (.*)\.$/, "Customer status: $1."],
    [/^Conexión mock: (.*)\.$/, "Mock connection: $1."],
    [/^Escenario activo: (.*)\.$/, "Active scenario: $1."],
    [/^FILTRO ACTIVO \/\/ ID:(.*)$/, "ACTIVE FILTER // ID:$1"],
    [/^Progreso: (.*)$/, "Progress: $1"],
    [/^Reducir (.*)$/, "Decrease $1"],
    [/^Aumentar (.*)$/, "Increase $1"],
    [/^EXPEDIENTE \/\/ (.*)$/, "DOSSIER // $1"],
    [/^(.*) procesada\.$/, "$1 processed."],
    [/^(.*) actualizado\.$/, "$1 updated."],
    [/^Rol cambiado a (.*)\.$/, "Role changed to $1."],
    [/^Pedido (.*) registrado manualmente\.$/, "Order $1 registered manually."],
    [/^Factura (.*) emitida para (.*)\.$/, "Invoice $1 issued for $2."],
    [/^Factura (.*) generada para (.*)\.$/, "Invoice $1 generated for $2."],
    [/^Webhook verificado para (.*)\.$/, "Webhook verified for $1."],
    [/^Alerta inventario crítico SKU: (.*)\.$/, "Critical stock alert SKU: $1."],
    [/^Stock actualizado para (.*): (\d+) uds\.$/, "Stock updated for $1: $2 units."],
    [/^(.*) emitida correctamente\.$/, "$1 issued successfully."],
    [/^Factura (.*) emitida con éxito \/\/ PDF generado$/, "Invoice $1 issued successfully // PDF generated"],
    [/^La persistencia local no está disponible; se usará un fallback en memoria\.$/, "Local persistence is unavailable; the workspace continues in memory."],
    [/^No se pudo guardar el snapshot local; el workspace continúa en memoria\.$/, "The local snapshot could not be saved; the workspace continues in memory."],
    [/^No se pudo leer el snapshot local; se usarán fixtures seguros en memoria\.$/, "The local snapshot could not be read; safe fixtures will be used in memory."],
    [/^El snapshot local contiene JSON inválido; se restaurarán fixtures seguros\.$/, "The local snapshot contains invalid JSON; safe fixtures will be restored."],
    [/^El snapshot local no coincide con el contrato vigente; se restaurarán fixtures seguros\.$/, "The local snapshot does not match the current contract; safe fixtures will be restored."],
    [/^No se pudo limpiar el snapshot inválido; el fallback en memoria sigue activo\.$/, "The invalid snapshot could not be cleared; the memory fallback remains active."],
  ];
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(value)) return value.replace(pattern, replacement);
  }
  return value;
}

const runtimeMessages = {
  "La operación mock no pudo completarse.": "The mock action could not be completed.",
  "Cerrar panel": "Close panel",
  "Cerrar modal": "Close modal",
  "Persistencia local no disponible; cambios mantenidos en memoria.": "Local persistence unavailable; changes retained in memory.",
  "Snapshot no válido; se han restaurado fixtures seguros.": "Invalid snapshot; safe fixtures restored.",
  "El cliente es obligatorio.": "A customer is required.",
  "El pedido necesita al menos un artículo.": "The order needs at least one item.",
  "Las cantidades deben ser enteros positivos.": "Quantities must be positive integers.",
  "El importe debe ser un número finito no negativo.": "The amount must be a finite non-negative number.",
  "El nombre es obligatorio.": "A name is required.",
  "El email no es válido.": "The email is invalid.",
  "El pedido actualizado no es válido.": "The updated order is invalid.",
  "El cliente actualizado no es válido.": "The updated customer is invalid.",
  "La factura actualizada no es válida.": "The updated invoice is invalid.",
  "La alerta de stock actualizada no es válida.": "The updated stock alert is invalid.",
  "El evento de auditoría no es válido.": "The audit event is invalid."
} as const;
