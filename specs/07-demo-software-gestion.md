# SPEC 07 — Demo Software de gestión interactiva con mocks

> **Status:** Aprobados
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-26
> **Objective:** Implementar la demo "Software de gestión" como ruta `/demos/software-gestion` interactiva con mocks, fiel a `references/04_demo_software_de_gesti_n/screen.png`, reutilizando primitivas UI y animaciones de SPEC 01-02.

## Por qué existe esta spec

La landing (SPEC 01) enlaza un sandbox de "Software de gestión" que no existe. La referencia `references/04_demo_software_de_gesti_n/` trae el diseño completo (KPIs, gráfico lineal, tabla de facturas, alertas de stock, citas) en `code.html` + `screen.png`. Hace falta convertirlo en una ruta Next.js interactiva que demuestre el producto con datos ficticios, sin backend, siguiendo el mismo patrón que SPEC 04 (Agente de leads).

## Alcance

**In:**

- Ruta `/demos/software-gestion` con cabecera de demo (volver al portfolio, badge `DEMO · DATOS FICTICIOS`, tabs funcionales: RESUMEN / CLIENTES / FACTURAS / INVENTARIO / AJUSTES).
- Vista **RESUMEN** (default): 4 KPIs superiores, gráfico de líneas "Evolución de ingresos y cobros" (SVG inline), panel "Citas de hoy" (4 citas), tabla "Últimas facturas emitidas" (4 filas + paginación inerte), alertas "Inventario" (3 ítems críticos + botón ver inventario completo).
- Vistas **CLIENTES**, **FACTURAS**, **INVENTARIO**, **AJUSTES**: placeholders visuales con mensaje "Próximamente en esta demo" (coherente con tabs de SPEC 04 donde Actividad/Ajustes tienen contenido distinto).
- Selector de rango de fechas ("Últimos 30 días") inerte, solo visual.
- Botones "EXPORTAR" y "NUEVA FACTURA" inertes con toast `[placeholder]` al click.
- Botones "PEDIR A PROVEEDOR" / "REORDENAR" en alertas de stock inertes con toast `[placeholder]`.
- Mocks en `lib/data/software.ts` (tipos `Kpi`, `Invoice`, `Appointment`, `StockAlert`, `ChartPoint`) todo `[placeholder]`.
- Cablear el botón "Explorar sandbox" del Software de gestión en la landing hacia `/demos/software-gestion`.
- Animaciones de entrada reutilizando `ScrollAnimations` y sus hooks `data-anim` (`fade-up`, `stagger-in`, `draw-line`, `count-up`).
- Verificación con capturas Playwright a 1440px y 390px comparadas con `screen.png`.

**Fuera de alcance (specs futuras):**

- Backend real o conexión Supabase para esta demo (usa mocks locales; el corte es otra spec).
- Filtros funcionales por fecha, cliente, estado en la tabla de facturas.
- Paginación real, orden por columnas, drag & drop.
- Gráfico con librería externa (Recharts/Chart.js) — se mantiene SVG inline.
- Persistencia de estado entre tabs o recargas.
- Demos 03 (Pedidos tiempo real) y 05 (Zona miembros) y 06 (Editor blog).
- Contenido biográfico real ni imágenes locales.

## Modelo de datos

Mocks en `lib/data/software.ts`, sin persistencia:

```ts
// lib/data/software.ts

export type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone: "accent" | "teal" | "ochre" | "muted";
  progress?: number; // para barra de meta (0-100)
  progressLabel?: string;
};

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
```

Convención: todo dato ficticio lleva `// [placeholder]`. La UI muestra el badge `DEMO · DATOS FICTICIOS` de la referencia.

## Plan de implementación

1. **Datos.** Crear tipos y mocks en `lib/data/software.ts` (4 KPIs, ~12 puntos de gráfico, 4 facturas, 4 citas, 3 alertas stock) y cablear el sandbox de la landing a `/demos/software-gestion`. *Verificar:* `npx tsc --noEmit` pasa y `npm run build` termina sin errores.
2. **Ruta y cabecera.** Crear `app/demos/software-gestion/page.tsx` con cabecera de demo (volver, badge, tabs con estado local) y vista RESUMEN por defecto. *Verificar:* `/demos/software-gestion` renderiza cabecera y tabs.
3. **KPIs + Gráfico + Citas.** Implementar los 4 KPIs con `data-anim="count-up"` y `data-anim="draw-line"` en barras de progreso; gráfico SVG inline con paths del HTML de referencia y `data-anim="draw-line"` en las dos líneas; panel citas con 4 ítems y `data-anim="stagger-in"`. *Verificar:* valores 48.250 €, 342, 8.410 €, 34.6% y gráfico visible.
4. **Tabla facturas + Stock.** Implementar tabla con 4 filas (estados pagada/pendiente/vencida) + paginación inerte; panel stock con 3 alertas + botón "INVENTARIO COMPLETO". *Verificar:* badges de estado con colores correctos (teal/ochre/rojo), barras de stock al 10%, 12%, 6.6%.
5. **Tabs secundarias.** Implementar vistas CLIENTES, FACTURAS, INVENTARIO, AJUSTES como placeholders con mensaje "Próximamente en esta demo" y `data-anim="fade-up"`. *Verificar:* tabs conmutan sin recargar.
6. **Interacciones menores.** Toasts `[placeholder]` en EXPORTAR, NUEVA FACTURA, PEDIR A PROVEEDOR, REORDENAR. Selector fecha inerte. *Verificar:* clicks no rompen, toasts aparecen.
7. **QA visual.** Capturas Playwright a 1440px y 390px en `.playwright-mcp/07-demo-software-gestion/after/`, comparar con `references/04_demo_software_de_gesti_n/screen.png` y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía, ritmo, tipografía, color, alineación y cero errores.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `/demos/software-gestion` muestra cabecera, 5 tabs, y vista RESUMEN por defecto con 4 KPIs, gráfico, citas, tabla facturas, alertas stock.
- [ ] Los 5 tabs conmutan de vista sin recargar; CLIENTES/FACTURAS/INVENTARIO/AJUSTES muestran placeholder "Próximamente en esta demo".
- [ ] KPIs animan `count-up` al entrar en viewport; barras de progreso animan `draw-line`.
- [ ] Gráfico SVG muestra dos líneas (facturación naranja, cobros teal) con punto destacado en semana 03 y tooltip.
- [ ] Tabla muestra 4 facturas con badges de estado coloreados (teal pagada, ochre pendiente, rojo vencida) y paginación inerte.
- [ ] Alertas stock muestran 3 ítems con barras de progreso al 10%, 12%, 6.6% y botones inertes con toast.
- [ ] Botones EXPORTAR, NUEVA FACTURA, PEDIR A PROVEEDOR, REORDENAR disparan toast `[placeholder]`.
- [ ] Selector "Últimos 30 días" es visual, no funcional.
- [ ] "Explorar sandbox" del Software de gestión en la landing navega a `/demos/software-gestion` y "Volver al portfolio" a `/`.
- [ ] Las capturas a 1440px y 390px no muestran desviaciones respecto a `screen.png`.
- [ ] Todo dato ficticio está marcado con `[placeholder]` en `lib/data/software.ts` y no hay llamadas de red a backend.
- [ ] Con `prefers-reduced-motion: reduce` no se ejecutan animaciones de scroll.

## Decisiones

- **Sí:** ruta `/demos/software-gestion` consistente con `/demos/leads`. **No:** `/demos/management` o `/demos/erp`.
- **Sí:** 5 tabs funcionales con estado local (como SPEC 04). **No:** solo visual o solo RESUMEN funcional.
- **Sí:** selector de fecha inerte. **No:** filtro funcional con opciones 7d/30d/90d/custom.
- **Sí:** botones EXPORTAR/NUEVA FACTURA/PEDIR/REORDENAR inertes + toast `[placeholder]`. **No:** funcionales mínimos.
- **Sí:** gráfico SVG inline hardcodeado (fidelidad 1:1 al `screen.png`, cero deps). **No:** Recharts/Chart.js.
- **Sí:** tabla facturas solo visual (4 filas + paginación inerte). **No:** paginación/orden funcional.
- **Sí:** mocks locales en `lib/data/software.ts` (estilo SPEC 04). **No:** depender de SPEC 03 / capa `lib/data/` unificada.
- **Sí:** vistas secundarias como placeholders "Próximamente". **No:** contenido mock completo en cada tab.
- **Sí:** reutilizar `ScrollAnimations` y primitivas `ui/` (`Section`, `SectionHeading`, `HairlineDivider`, `Chip`). **No:** sistema propio.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El SVG inline del gráfico no escala bien en mobile | Verificar en capturas 390px; el HTML de referencia ya es responsive |
| Los toasts `[placeholder]` no tienen diseño definido | Usar el mismo patrón que SPEC 04 (toast simple con `data-anim="fade-up"`) |
| La hidratación SSR rompe el estado de tabs | Componente cliente con `useState` para tab activo; SSR renderiza RESUMEN |
| El gráfico SVG tiene paths hardcodeados que no coinciden con datos mock | Los paths son decorativos (igual que en el HTML ref); los tooltips y ejes sí usan datos mock |

## Lo que **no** está en esta spec

- Backend real, Supabase para la demo, drag & drop, filtros funcionales.
- Librería de gráficos, paginación/orden real, persistencia de estado.
- Demos 03, 05, 06, zona de miembros, editor de blog.
- Assets locales, contenido real, deploy.