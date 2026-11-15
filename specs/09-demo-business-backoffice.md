# SPEC 09 — Reconstrucción fiel de la demo Business Backoffice

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-15
> **Objective:** Sustituir la demo reducida de `/es/demos/business-backoffice` por una superficie de backoffice empresarial fiel a `resources/09_demo_business_backoffice`, manteniendo datos y flujos en mocks deterministas y dejando contratos preparados para una integración futura de producción.

## Scope

**In:**

- Reconstruir la superficie visual de `resources/09_demo_business_backoffice/screen.png` y `code.html`.
- Mantener la ruta `/es/demos/business-backoffice` pública y accesible sin autenticación real.
- Mantener la dirección visual de la referencia: tema oscuro, tipografías editoriales y monoespaciadas, hairlines, geometría cuadrada, densidad alta y uso limitado del naranja.
- Implementar la cabecera técnica, navegación lateral, selector de periodo, búsqueda `FIND_SYS`, estado de sincronización y selector de roles.
- Implementar los roles mock `ADMIN`, `EDITOR` y `LECTOR` con permisos visuales y operativos deterministas.
- Implementar el banner de acceso restringido del modo lector y el bloqueo accesible de mutaciones.
- Implementar los cuatro KPIs: ventas del mes, pedidos totales, ticket medio y nuevos clientes.
- Implementar la comparativa de facturación de febrero frente a enero de 2025 con gráfica SVG determinista y series mock por periodo.
- Implementar la tabla de últimos pedidos con búsqueda, paginación, estados, detalle de cliente y acción `[ VER ]`.
- Implementar `+ REGISTRAR PEDIDO MANUAL` con formulario mock validado y actualización del workspace.
- Implementar `EXPORTAR CSV` con descarga local de los pedidos visibles o filtrados.
- Implementar el drawer de expediente de cliente con identidad, métricas, historial, anotaciones internas y acciones autorizadas.
- Implementar las facturas pendientes con emisión, reclamación y estados `VENCE EN 3D`, `VENCE HOY` y `VENCIDA`.
- Implementar las alertas de stock con cantidades, mínimos, severidad y actualización mock del inventario.
- Implementar el audit log realtime mock con eventos de pedidos, facturas, stock, permisos y exportaciones.
- Implementar los estados del simulador `EN VIVO`, `DRAWER CLIENTE`, `MODO LECTOR`, `TOAST EMITIDO`, `ESQUELETOS` y `TABLA VACÍA`.
- Persistir el workspace mediante un snapshot versionado en `localStorage`.
- Recuperar fixtures seguros ante snapshot inválido, incompatible, ilegible o almacenamiento no disponible, mostrando feedback accesible no bloqueante.
- Mantener contratos de dominio, repositorio, runtime y exportación separados de React, `localStorage` y proveedores externos.
- Adaptar la composición a 375px y 1440px sin overflow horizontal, conservando la prioridad de la referencia en escritorio y reorganizando la información en móvil.
- Mantener nombres accesibles, foco visible, navegación por teclado, cierre del drawer con `Escape`, regiones vivas y respeto de `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para dominio, roles, filtros, acciones, persistencia, estados, accesibilidad y responsive.

**Out of scope (for future specs):**

- Conectar Supabase, una API HTTP, CRM, Stripe, Correos, ERP o cualquier proveedor externo.
- Crear tablas, migraciones, políticas RLS, persistencia remota o sincronización multiusuario.
- Implementar autenticación real, sesiones reales o autorización server-side.
- Emitir facturas fiscales reales, cobrar pedidos, enviar emails o ejecutar reclamaciones reales.
- Crear workers, colas, cron jobs, telemetría de producción o despliegues reales.
- Compartir estado o fixtures con `/es/demos/leads-workflow`, `/es/demos/lead-qualification` o `/es/demos/orders-realtime`.
- Añadir gráficos interactivos complejos, drag-and-drop o nuevas dependencias.
- Internacionalización fuera de `/es/`.

## Data model

La implementación mantiene un workspace mock persistente. Los contratos no dependen de React, `localStorage` ni proveedores externos. Los importes se almacenan en céntimos para evitar errores de precisión y se formatean como euros en la UI. Las fechas, horas, latencias, páginas y cambios de métricas son fixtures deterministas; el runtime no utiliza `Date`, `Math.random`, red ni intervalos aleatorios.

### Backoffice workspace

```ts
type BackofficeRole = "ADMIN" | "EDITOR" | "LECTOR";

type BackofficeSimulationState =
  | "live"
  | "drawer"
  | "reader"
  | "toast"
  | "skeletons"
  | "empty";

type BackofficePeriod = "feb-2025" | "jan-2025";

type OrderStatus =
  | "processing"
  | "paid"
  | "shipped"
  | "invoiced"
  | "pending-payment";

type OrderItem = {
  label: string;
  quantity: number;
};

type BackofficeOrder = {
  id: string;
  customerId: string;
  customerName: string;
  company: string;
  location: string;
  items: OrderItem[];
  relativeTime: string;
  totalCents: number;
  status: OrderStatus;
};

type CustomerHistoryItem = {
  orderId: string;
  totalCents: number;
  items: string;
  status: "processing" | "delivered" | "invoiced";
};

type CustomerDossier = {
  id: string;
  name: string;
  email: string;
  phoneAndAddress: string;
  totalSpendCents: number;
  orderCount: number;
  averageTicketCents: number;
  history: CustomerHistoryItem[];
  internalNotes: string;
};

type InvoiceStatus = "due-in-3d" | "due-today" | "overdue";

type PendingInvoice = {
  id: string;
  customer: string;
  amountCents: number;
  status: InvoiceStatus;
};

type StockSeverity = "warning" | "critical";

type StockAlert = {
  sku: string;
  label: string;
  quantity: number;
  minimum: number;
  severity: StockSeverity;
};

type BackofficeMetric = {
  id: "revenue" | "orders" | "average-ticket" | "new-customers";
  label: string;
  value: string;
  detail: string;
  trend: string;
};

type RevenuePoint = {
  label: string;
  currentCents: number;
  previousCents: number;
};

type AuditEventType =
  | "order"
  | "invoice"
  | "stock"
  | "role"
  | "export"
  | "system";

type BackofficeAuditEvent = {
  id: string;
  type: AuditEventType;
  actor: BackofficeRole | "STRIPE" | "STOCK" | "SYSTEM";
  message: string;
  at: string;
  tone: "accent" | "neutral" | "warning" | "error";
};

type BackofficeWorkspace = {
  version: 1;
  role: BackofficeRole;
  simulationState: BackofficeSimulationState;
  period: BackofficePeriod;
  search: string;
  page: number;
  selectedCustomerId: string | null;
  orders: BackofficeOrder[];
  customers: CustomerDossier[];
  invoices: PendingInvoice[];
  stockAlerts: StockAlert[];
  metrics: Record<BackofficePeriod, BackofficeMetric[]>;
  revenueSeries: Record<BackofficePeriod, RevenuePoint[]>;
  auditEvents: BackofficeAuditEvent[];
  toast: string | null;
};
```

Los fixtures iniciales deben conservar los valores visibles en la referencia:

- Ventas del mes: `48.290,00 €`, `+22.4% vs ENE`, objetivo mensual `107.3% [ ALCANZADO ]`.
- Pedidos totales: `642`, `+48 UDS`, tasa de procesamiento `98.8% EN 24H`.
- Ticket medio: `75,20 €`, `+8.1% NETO`, línea destacada `MACETAS RAW`.
- Nuevos clientes: `118`, estado `ESTABLE`, recurrencia B2B `41.2%`.
- Serie de febrero: `8.420 €`, `10.980 €`, `12.000 €`, `16.890 €`.
- Total comparativo de enero: `39.450 €`; total de febrero: `48.290 €`.
- Pedidos iniciales: `#ORD-9042` Valeria Soler, `#ORD-9041` Mateo Benítez, `#ORD-9040` Clara Domínguez, `#ORD-9039` Arnau Puig y `#ORD-9038` Lucía Navarro.
- Importes iniciales: `240,00 €`, `185,00 €`, `92,50 €`, `310,00 €` y `420,00 €`, respectivamente.
- Facturas iniciales: `FAC-2025-089` por `1.450,00 €`, `FAC-2025-088` por `890,00 €` y `FAC-2025-084` por `2.120,00 €`.
- Stock inicial: `Jarrón Terracota Raw V` con `2` unidades y mínimo `10`; `Maceta Basalto Brut` con `3` y mínimo `15`; `Arcilla Chamota 25kg` con `1` unidad crítica.
- Auditoría inicial: factura `FAC-2025-089`, webhook verificado de `#ORD-9041` y alerta SKU `JARRON-RAW-05`.
- Drawer inicial: `CLI-8841`, Valeria Soler, `valeria.soler@arqdesign.es`, `3.420,00 €`, `14` pedidos y ticket medio `244,28 €`.

### Roles and permissions

```ts
type BackofficePermission =
  | "read"
  | "create-order"
  | "emit-invoice"
  | "edit-customer"
  | "update-stock"
  | "export-data";

const backofficePermissions: Record<BackofficeRole, BackofficePermission[]> = {
  ADMIN: [
    "read",
    "create-order",
    "emit-invoice",
    "edit-customer",
    "update-stock",
    "export-data",
  ],
  EDITOR: [
    "read",
    "create-order",
    "emit-invoice",
    "edit-customer",
    "update-stock",
    "export-data",
  ],
  LECTOR: ["read"],
};
```

El modo `LECTOR` debe mostrar el aviso de acceso restringido y deshabilitar las mutaciones con el texto y feedback equivalentes a la referencia. La autorización mock debe vivir en una política de dominio reutilizable, no en condiciones dispersas dentro de los componentes.

### Contracts

```ts
interface BackofficeRepository {
  getWorkspace(): Promise<BackofficeWorkspace>;
  updateWorkspace(input: Partial<BackofficeWorkspace>): Promise<BackofficeWorkspace>;
  updateOrder(id: string, input: Partial<BackofficeOrder>): Promise<BackofficeOrder>;
  updateCustomer(id: string, input: Partial<CustomerDossier>): Promise<CustomerDossier>;
  updateInvoice(id: string, input: Partial<PendingInvoice>): Promise<PendingInvoice>;
  updateStock(sku: string, input: Partial<StockAlert>): Promise<StockAlert>;
  appendAuditEvent(event: BackofficeAuditEvent): Promise<BackofficeAuditEvent>;
  resetWorkspace(): Promise<BackofficeWorkspace>;
}

interface BackofficeRuntimeService {
  setRole(input: { role: BackofficeRole }): Promise<BackofficeWorkspace>;
  setSimulationState(input: { state: BackofficeSimulationState }): Promise<BackofficeWorkspace>;
  setPeriod(input: { period: BackofficePeriod }): Promise<BackofficeWorkspace>;
  setSearch(input: { search: string }): Promise<BackofficeWorkspace>;
  setPage(input: { page: number }): Promise<BackofficeWorkspace>;
  selectCustomer(input: { customerId: string | null }): Promise<BackofficeWorkspace>;
  createManualOrder(input: {
    customerId: string;
    items: OrderItem[];
    totalCents: number;
  }): Promise<{ workspace: BackofficeWorkspace; order: BackofficeOrder }>;
  emitInvoice(input: { invoiceId: string }): Promise<BackofficeWorkspace>;
  editCustomer(input: {
    customerId: string;
    name: string;
    email: string;
    internalNotes: string;
  }): Promise<BackofficeWorkspace>;
  updateStock(input: {
    sku: string;
    quantity: number;
  }): Promise<BackofficeWorkspace>;
  exportOrdersCsv(): Promise<{ filename: string; content: string }>;
  dismissToast(): Promise<BackofficeWorkspace>;
}

interface BackofficeCsvExporter {
  createOrdersCsv(input: { orders: BackofficeOrder[] }): string;
  download(input: { filename: string; content: string }): void;
}
```

Los componentes consumen estos contratos y no acceden directamente a fixtures, `localStorage`, APIs del navegador ni proveedores externos. El adaptador actual será local y mock; el contrato debe permitir sustituirlo por un repositorio remoto sin cambiar la composición ni las reglas de dominio.

## Validation

- Todos los IDs de pedidos, clientes, facturas, SKUs y eventos deben ser únicos dentro del workspace.
- Los importes deben ser finitos y mayores o iguales que cero; las sumas se calculan en céntimos.
- Los pedidos manuales requieren cliente, al menos un artículo, cantidades enteras positivas e importe válido.
- La búsqueda debe normalizar mayúsculas, minúsculas y acentos para encontrar ID, cliente, empresa, artículo o estado.
- La paginación debe mantener una página válida cuando el filtro reduzca el total de registros.
- `ADMIN` y `EDITOR` pueden ejecutar las mutaciones definidas; `LECTOR` solo puede consultar y cambiar simulación, periodo o búsqueda.
- Una mutación no autorizada no modifica el workspace y deja feedback accesible con el motivo del bloqueo.
- Emitir una factura cambia su estado, registra un evento y es idempotente si ya fue emitida.
- Editar un cliente exige nombre y email válidos; cancelar conserva el estado anterior.
- Actualizar stock no acepta cantidades negativas y recalcula severidad según el mínimo.
- Exportar CSV debe respetar el conjunto filtrado, escapar comas, comillas y saltos de línea, y producir cabecera estable.
- El simulador `drawer` abre el expediente de `CLI-8841`, `reader` activa `LECTOR`, `toast` muestra el aviso, `skeletons` oculta datos y `empty` muestra la tabla vacía.
- Volver a `live` restaura la vista operativa, conserva las mutaciones persistidas y cierra el drawer o toast activo cuando corresponda.
- El snapshot solo se restaura si coincide la versión y pasan todas las validaciones de estructura, estados, IDs, importes y colecciones.
- Un snapshot corrupto, incompatible o ilegible debe restaurar fixtures seguros y activar un aviso no bloqueante.
- El fallback en memoria debe mantener operativa la demo cuando `localStorage` no esté disponible.
- La UI no debe realizar llamadas de red ni depender de reloj real o aleatoriedad.

## Implementation plan

1. Crear tipos, estados, roles, permisos, constantes, fixtures y validadores del dominio Business Backoffice.
2. Implementar métricas, series de facturación, cálculo de periodos, formateo monetario y derivación de KPIs.
3. Implementar el repositorio mock persistente con snapshot versionado, validación, recuperación y fallback en memoria.
4. Implementar el runtime mock para roles, permisos, simulador, búsqueda, paginación, drawer y acciones de negocio.
5. Implementar el servicio de exportación CSV con escaping determinista y descarga local.
6. Sustituir el panel actual por el shell visual de la referencia reutilizando tokens y primitivas UI existentes.
7. Implementar cabecera, navegación lateral, selector de periodo, búsqueda, sincronización, roles y banner de lector.
8. Implementar los cuatro KPIs y la gráfica SVG comparativa con estados de datos y esqueletos.
9. Implementar la tabla de pedidos, estados, paginación, registro manual, tabla vacía y exportación CSV.
10. Implementar el drawer de cliente, emisión de factura, edición mock, historial y notas internas.
11. Implementar facturas pendientes, alertas de stock y audit log.
12. Integrar los seis estados del simulador con feedback accesible y transiciones deterministas.
13. Implementar responsive a 375px y 1440px, foco, teclado, `Escape`, regiones vivas y `prefers-reduced-motion`.
14. Añadir tests unitarios y de componentes para dominio, permisos, filtros, acciones, persistencia, CSV y simulador.
15. Actualizar el flujo E2E de la demo y verificar roles, drawer, toast, esqueletos, tabla vacía, responsive y teclado.
16. Ejecutar lint, typecheck, tests, build, E2E y validación estricta de OpenSpec.
17. Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas.

## Acceptance criteria

- [x] `/es/demos/business-backoffice` reproduce la composición principal de `screen.png` sin errores de runtime.
- [x] La UI conserva el tema oscuro, tipografías, hairlines, geometría cuadrada, densidad y acento naranja de la referencia.
- [x] La cabecera incluye navegación técnica, estado de sincronización, búsqueda, periodo y selector de roles.
- [x] Los cuatro KPIs iniciales muestran `48.290,00 €`, `642`, `75,20 €` y `118` con sus textos y tendencias de referencia.
- [x] La gráfica muestra febrero frente a enero de 2025 con los puntos `8.420 €`, `10.980 €`, `12.000 €` y `16.890 €`.
- [x] La tabla inicial contiene exactamente `#ORD-9042`, `#ORD-9041`, `#ORD-9040`, `#ORD-9039` y `#ORD-9038` con clientes, artículos, tiempos, importes y estados de la referencia.
- [x] La búsqueda encuentra pedidos por ID, cliente, empresa, artículo o estado sin llamadas externas.
- [x] La paginación cambia de página, mantiene una página válida tras filtrar y muestra metadatos de registros.
- [x] `+ REGISTRAR PEDIDO MANUAL` valida el formulario, crea un pedido mock, actualiza métricas y añade un evento de auditoría.
- [x] `EXPORTAR CSV` descarga un archivo local con cabecera estable y los pedidos filtrados correctamente escapados.
- [x] `[ VER ]` abre el drawer del cliente correcto y muestra sus datos, métricas, historial y notas internas.
- [x] El drawer permite emitir factura y editar expediente cuando el rol tiene permiso, con cancelación y feedback accesible.
- [x] Las facturas iniciales muestran `FAC-2025-089`, `FAC-2025-088` y `FAC-2025-084` con sus importes y estados.
- [x] Las acciones de factura son idempotentes y quedan registradas en el audit log.
- [x] Las alertas iniciales muestran los tres productos, cantidades, mínimos, barras y severidades de la referencia.
- [x] Actualizar stock rechaza cantidades negativas, recalcula severidad y registra la operación.
- [x] `ADMIN`, `EDITOR` y `LECTOR` actualizan el badge y aplican los permisos definidos.
- [x] En modo `LECTOR` las mutaciones quedan bloqueadas, aparece el aviso de acceso restringido y se informa del motivo sin romper la navegación.
- [x] `EN VIVO`, `DRAWER CLIENTE`, `MODO LECTOR`, `TOAST EMITIDO`, `ESQUELETOS` y `TABLA VACÍA` producen estados reproducibles.
- [x] El estado `TABLA VACÍA` ofrece la acción accesible para reiniciar el stream y recuperar la vista operativa.
- [x] El estado `ESQUELETOS` no muestra datos reales mientras está activo y recupera el contenido al volver a `live`.
- [x] El toast se puede cerrar, se anuncia mediante región viva y no depende de temporizadores aleatorios.
- [x] Pedidos, clientes, facturas, stock, rol, filtros, periodo, simulación y audit log se recuperan tras recargar mediante `localStorage` versionado.
- [x] Un snapshot corrupto, incompatible o ilegible restaura fixtures seguros y muestra feedback no bloqueante y accesible.
- [x] Si `localStorage` no está disponible, la demo funciona en memoria y comunica la limitación sin bloquear la UI.
- [x] Existen contratos independientes de la UI para repositorio, runtime y exportación CSV.
- [x] La ruta no exige sesión, no ejecuta llamadas de red y no conecta proveedores reales.
- [x] La UI funciona a 375px y 1440px sin desbordamiento horizontal de página ni pérdida de acciones principales.
- [x] El drawer funciona con teclado, conserva foco, se cierra con `Escape` y restaura el foco al control de origen.
- [x] Los controles tienen nombres accesibles, foco visible, navegación por teclado y feedback en regiones vivas.
- [x] Las animaciones respetan `prefers-reduced-motion`.
- [x] No se añaden dependencias nuevas.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm build` pasa.
- [x] `pnpm test:e2e` pasa en móvil y escritorio.
- [x] `openspec validate 09-demo-business-backoffice --strict` pasa.

## Nota de verificación

- Verificación independiente 2026-11-15: APPROVED; 38/38 criterios PASS con E2E desktop 2/2, verificación Playwright responsive y quality gates completados.

## Traceability

| Requirement | Task | Test | Verification |
| --- | --- | --- | --- |
| REQ-001 | TASK-006, TASK-007 | TEST-E2E-BACKOFFICE, TEST-E2E-REGRESSION | PENDING |
| REQ-002 | TASK-001, TASK-002 | TEST-UNIT-FIXTURES, TEST-COMPONENT-VISUAL | PENDING |
| REQ-003 | TASK-002, TASK-008 | TEST-UNIT-METRICS, TEST-COMPONENT-FILTERS | PENDING |
| REQ-004 | TASK-004, TASK-008 | TEST-UNIT-ROLES, TEST-COMPONENT-READER | PENDING |
| REQ-005 | TASK-004, TASK-009 | TEST-UNIT-ORDERS, TEST-COMPONENT-ORDERS, TEST-E2E-BACKOFFICE | PENDING |
| REQ-006 | TASK-005, TASK-009 | TEST-UNIT-CSV, TEST-COMPONENT-EXPORT | PENDING |
| REQ-007 | TASK-004, TASK-010 | TEST-UNIT-DRAWER, TEST-COMPONENT-DRAWER, TEST-E2E-KEYBOARD | PENDING |
| REQ-008 | TASK-004, TASK-011 | TEST-UNIT-INVOICES, TEST-COMPONENT-INVOICES | PENDING |
| REQ-009 | TASK-004, TASK-011 | TEST-UNIT-STOCK, TEST-COMPONENT-STOCK | PENDING |
| REQ-010 | TASK-012 | TEST-COMPONENT-SIMULATOR, TEST-E2E-SIMULATOR | PENDING |
| REQ-011 | TASK-003 | TEST-UNIT-REPOSITORY, TEST-E2E-RECOVERY | PENDING |
| REQ-012 | TASK-013 | TEST-A11Y, TEST-E2E-KEYBOARD | PENDING |
| REQ-013 | TASK-013, TASK-015 | TEST-E2E-RESPONSIVE | PENDING |
| REQ-014 | TASK-014, TASK-016 | TEST-QUALITY-GATES, TEST-SPEC-VALIDATION | PENDING |

The requirement identifiers above map to the fourteen planned OpenSpec requirements in the same order: visual/public surface, reference fixtures, filtering and analytics, roles, orders, CSV, customer dossier, invoices, stock, simulator states, persistence and recovery, contracts, responsive/accessibility, and quality gates.

## Decisions

- **Sí:** reconstrucción completa de la superficie visible de `resources/09_demo_business_backoffice`, no solo ampliación del panel actual.
- **Sí:** mantener exactamente los textos, clientes, pedidos, importes, facturas, stock y eventos visibles en `screen.png` y `code.html` como fixtures iniciales.
- **Sí:** mantener la ruta pública, sin autenticación real y con roles únicamente mock.
- **Sí:** `ADMIN` y `EDITOR` pueden mutar; `LECTOR` solo consulta y recibe feedback de acceso restringido.
- **Sí:** persistir el workspace mediante snapshot versionado en `localStorage`, con validación, recuperación segura y fallback en memoria.
- **Sí:** implementar acciones locales completas: pedido manual, CSV descargable, drawer, facturación, edición y stock.
- **Sí:** recalcular métricas y series de facturación de forma determinista según el periodo.
- **Sí:** separar repositorio, runtime, política de permisos y exportador CSV de la UI.
- **Sí:** usar solo dependencias existentes; no instalar librerías nuevas.
- **Sí:** verificar 375px y 1440px, teclado, foco, `Escape`, regiones vivas y `prefers-reduced-motion`.
- **No:** conectar proveedores reales, emitir facturas fiscales, cobrar pedidos, persistir remotamente o implementar auth/RBAC server-side.

## Risks

| Risk | Mitigation |
| --- | --- |
| La referencia tiene una densidad superior al panel actual | Construir primero la composición estructural y verificar capturas a 375px y 1440px. |
| El selector de rol puede dejar controles inconsistentes | Centralizar permisos en una política de dominio y cubrir cada mutación por rol. |
| Los estados de simulación pueden ocultar accidentalmente datos | Mantenerlos como estado explícito y restaurable, con feedback visible y retorno a `live`. |
| `localStorage` puede estar corrupto, bloqueado o lleno | Validar snapshots, recuperar fixtures seguros y operar con fallback en memoria. |
| La exportación CSV puede romperse con caracteres especiales | Escapar comillas, comas y saltos de línea y cubrirlo con tests unitarios. |
| El drawer puede perder foco al abrirse o cerrarse | Reutilizar la primitiva `Drawer` existente y verificar foco, teclado y `Escape` con Playwright. |
| La frontera mock puede quedar acoplada a la UI | Mantener contratos asíncronos, tipos de dominio y adaptadores independientes. |

## What is **not** in this spec

- Supabase Database, Auth, Storage o RLS.
- APIs HTTP, CRM, ERP, Stripe, Correos, proveedores de email o sistemas fiscales.
- Facturación real, cobros, reclamaciones reales o comunicaciones externas.
- Workers, colas, cron jobs, telemetría de producción o despliegues reales.
- Gestión multiusuario, multi-workspace, colaboración o sincronización entre dispositivos.
- Gráficos interactivos complejos, drag-and-drop o nuevas dependencias.
- Integración de datos con las demás demos.
- Internacionalización fuera de `/es/`.
