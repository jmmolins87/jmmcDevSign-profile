# SPEC 06 — Demo Pedidos en tiempo real con transiciones y simulación en vivo

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03, SPEC 04, SPEC 05
> **Date:** 2026-09-26
> **Objective:** Implementar la demo «Pedidos en tiempo real» como ruta `/demos/pedidos` con tablero de tres columnas, transiciones de estado, simulación en vivo y datos mock.

## Por qué existe esta spec

La landing enlaza la demo «Pedidos en tiempo real» con `href="#"` y la referencia `references/03_demo_pedidos_en_tiempo_real/` trae el diseño completo (`code.html` + `screen.png`): tablero Nuevo / En preparación / Listo, dossier de comanda a la derecha, barra de tabs con búsqueda y franja «En vivo». Hace falta convertirlo en una ruta Next.js interactiva que demuestre cambios de estado en tiempo real, siguiendo el patrón de mocks ya aprobado en SPEC 04.

## Alcance

**In:**

- Ruta `/demos/pedidos` con sub-barra de demo (volver al portfolio + badge `DEMO · DATOS FICTICIOS`), **shell propio** en `app/demos/pedidos/` sin tocar la demo de leads.
- Barra superior: tabs `Pedidos 18` / `Productos 42` / `Ajustes` (solo Pedidos activo; los otros dos **inertes**), búsqueda `Buscar por ID, comensal…` y select de canales **funcionales** con estado «sin resultados».
- Franja en vivo: título `Pedidos en tiempo real`, píldora `EN VIVO · SINCRONIZADO HACE N S` (tick cada segundo, se reinicia en cada sincronización) y contadores `NUEVOS / EN PREPARACIÓN / LISTOS` **derivados de los datos** (pad a 2 dígitos).
- Kanban de 3 columnas (`NUEVO`, `EN PREPARACIÓN`, `LISTO`) con contadores derivados, icono por columna y tarjetas clicables que actualizan el dossier. 18 pedidos mock (5 + 8 + 5) para que los contadores cuadren con la referencia.
- Dossier del pedido seleccionado: cabecera `#id` + canal + hora de emisión, botón imprimir **inerte**, comensal, línea de entrega, detalle de comanda, **nota de cocina solo si el pedido la tiene**, desglose Subtotal / IVA inc. (10%) / Total calculado desde los artículos, y botones `MARCAR COMO LISTO` y `CANCELAR PEDIDO`.
- Transiciones de estado reales: `MARCAR COMO LISTO` mueve el pedido a la columna Listo; `CANCELAR PEDIDO` lo retira del tablero; **sin diálogo de confirmación**. El badge de la tarjeta se sustituye por el por defecto de la columna destino.
- Resaltado `⚡ ACTUALIZADO AHORA` + borde rojo izquierdo: **sigue al último pedido actualizado** (inicialmente `#1043`) y se apaga a los ~5 s.
- Toast flotante abajo a la derecha con `aria-live="polite"`, botón ✕ y auto-cierre a los 7 s; se dispara en cada cambio de estado (botón o timer).
- Simulación en vivo: timer de ~15 s que avanza un pedido (Nuevo → En preparación → Listo) de forma determinista, **desactivado con `prefers-reduced-motion`**.
- Búsqueda (ID o comensal, case-insensitive) y filtro por canal (`Todos los canales` / `Web Directa` / `Take Away (Mesa)` / `Glovo / Delivery`).
- Estados vacíos con texto monospace en mayúsculas: columna sin pedidos y búsqueda sin resultados.
- Mocks en `lib/data/orders.ts` con tipos `OrderColumn`, `OrderChannel`, `OrderItem` y `Order` en `lib/data/types.ts`, todo `// [placeholder]`.
- Cablear la fila «Pedidos en tiempo real» de `lib/content.ts` de `"#"` a `"/demos/pedidos"` (el overlay de menú la hereda solo, porque reutiliza `demos`).
- Animaciones reutilizando los hooks existentes `stagger-in` y `count-up`; el pulso del punto `EN VIVO` y la entrada del toast van con CSS propio de la demo.
- Capturas Playwright a 1440px y 390px en `.playwright-mcp/06-demo-pedidos-tiempo-real/after/`.

**Fuera de alcance (specs futuras):**

- Vistas `Productos` y `Ajustes`: los tabs quedan inertes (la referencia no las diseña).
- Backend real, WebSockets o Supabase para esta demo (mocks; el corte es otra spec).
- Persistencia del estado entre recargas.
- Arrastrar tarjetas entre columnas (drag & drop).
- Impresión real de la comanda y acciones secundarias (el botón imprimir queda inerte).
- Pantalla 04 (Software de gestión) y el resto de pantallas pendientes.
- i18n (`EN` sigue inerte).

## Modelo de datos

Tipos nuevos en `lib/data/types.ts` y mocks en `lib/data/orders.ts`, sin persistencia (el estado vive en el componente y se resetea al recargar):

```ts
// lib/data/types.ts
export type OrderColumn = "nuevo" | "preparacion" | "listo";

export type OrderChannel = "web-directa" | "take-away" | "delivery";

export type OrderItem = { qty: number; name: string; price: number };

export type Order = {
  id: string;            // "1043"
  guest: string;         // "Laura Sanmartín"
  channel: OrderChannel; // campo del filtro
  place: string;         // etiqueta visible del pie: "Mesa 04 / Takeaway", "Sala 02", "Barra"…
  delivery: string;      // línea del dossier: "Entrega local / Recogida en tienda (Mesa 04)"
  issuedAt: string;      // "13:42"
  ageLabel: string;      // "hace 1m" — estático del mock
  column: OrderColumn;
  badge: string;         // "PENDIENTE" | "EN HORNO" | "EMPAQUETANDO" | "ENTREGADO"…
  phone: string;         // "+34 654 892 •••"
  note?: string;         // nota de cocina; si falta, el bloque no se renderiza
  items: OrderItem[];
};
```

Convención y reglas derivadas:

- Todo dato ficticio lleva `// [placeholder]`. La UI muestra el badge `Demo · datos ficticios`.
- **18 pedidos**: 5 en `nuevo`, 8 en `preparacion`, 5 en `listo`. Contadores de la franja, contadores de columna y badge `Pedidos 18` se **derivan** de ese array.
- **Dinero en euros con IVA incluido en el precio de los artículos**: `total = Σ qty × price`, `subtotal = total / 1.10`, `iva = total − subtotal` (redondeo a 2 decimales). Para `#1043`: 52,80 € → 48,00 € + 4,80 €, como la referencia.
- **Badge por defecto al avanzar**: `nuevo → "PENDIENTE"`, `preparacion → "COCINANDO"`, `listo → "LISTO PARA RECOGER"`.
- **Filtro vs pie**: `channel` alimenta el select; `place` es la etiqueta del pie de la tarjeta (puede no ser un canal: «Sala 02», «Barra»).

Estado del shell (en memoria, `useState`):

```ts
orders: Order[];            // copia de MOCK_ORDERS
selectedId: string;         // inicial "1043"
query: string;              // "" → sin filtro
channel: OrderChannel | "all";
updatedId: string | null;   // resaltado ACTUALIZADO AHORA, se limpia a los ~5 s
toast: { id, orderId, to } | null;
syncedAgo: number;          // segundos desde la última sincronización, arranca en 1
```

## Plan de implementación

1. **Datos.** Añadir los 4 tipos a `lib/data/types.ts` y crear `lib/data/orders.ts` con `MOCK_ORDERS` (18 pedidos, 5/8/5, precios coherentes, notas solo en algunos). *Verificar:* `npx tsc --noEmit` pasa y los contadores por columna dan 5, 8 y 5.
2. **Ruta y toolbar.** Crear `app/demos/pedidos/page.tsx` (metadata, sub-barra volver + badge, contenedor `max-w-[1280px]`) y `Toolbar.tsx` con los 3 tabs (solo Pedidos activo), la búsqueda y el select, con estado local. *Verificar:* `/demos/pedidos` renderiza la sub-barra y la toolbar; pulsar `Productos` o `Ajustes` no cambia nada.
3. **Franja en vivo.** Crear `SummaryStrip.tsx` con los contadores derivados (pad a 2 dígitos), el punto `EN VIVO` con pulso CSS y el contador `SINCRONIZADO HACE N S` con tick de 1 s que se reinicia en cada sincronización. *Verificar:* muestra `05 / 08 / 05` y el contador sube con el tiempo.
4. **Kanban.** Crear `Kanban.tsx` y `OrderCard.tsx`: 3 columnas con contador derivado e icono, tarjetas clicables (selección) y estado vacío `SIN PEDIDOS EN ESTA COLUMNA`. *Verificar:* clicar 3 tarjetas distintas cambia la selección sin errores de consola.
5. **Dossier.** Crear `Dossier.tsx` con cabecera, comensal, entrega, artículos, nota condicional, desglose calculado y los dos botones (imprimir inerte). *Verificar:* con `#1043` seleccionado, Subtotal `48,00 €`, IVA `4,80 €`, Total `52,80 €`.
6. **Transiciones y toast.** En `Shell.tsx`, cablear `MARCAR COMO LISTO` (mueve a `listo` con badge `LISTO PARA RECOGER`) y `CANCELAR PEDIDO` (retira el pedido), actualizar `updatedId` (~5 s) y mostrar `LiveToast.tsx` (`aria-live="polite"`, ✕, auto-cierre 7 s). *Verificar:* marcar listo mueve la tarjeta, cambia `05/08/05` y aparece el toast.
7. **Timer en vivo.** Intervalo de ~15 s que avanza el primer pedido de `nuevo` a `preparacion` y, si no hay, el primero de `preparacion` a `listo`; sin intervalo con `prefers-reduced-motion: reduce`. *Verificar:* con movimiento hay un cambio cada ~15 s; con `reduce` no se crea el intervalo.
8. **Búsqueda y filtro.** Filtrar por ID o comensal (case-insensitive) y por canal, con estado `SIN RESULTADOS PARA «…»`; si el pedido seleccionado se filtra o se cancela, seleccionar el primero visible. *Verificar:* `Laura` deja 1 pedido; `Glovo / Delivery` muestra solo los de ese canal.
9. **Cableado de la landing.** Cambiar el `href` de la fila «Pedidos en tiempo real» en `lib/content.ts` a `/demos/pedidos`. *Verificar:* la fila navega a la demo y «Volver al portfolio» regresa a `/`.
10. **QA visual.** Capturar a 1440px y 390px en `.playwright-mcp/06-demo-pedidos-tiempo-real/after/`, comparar con `screen.png` y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía y cero errores.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `/demos/pedidos` muestra sub-barra (volver + badge), tabs con `Pedidos 18` activo, franja en vivo, 3 columnas con contadores `05 / 08 / 05` y dossier de `#1043`.
- [ ] `lib/data/orders.ts` contiene exactamente 18 pedidos (5 + 8 + 5) y todos los datos llevan `// [placeholder]`.
- [ ] Clicar tarjetas de columnas distintas actualiza el dossier (comensal, artículos y totales).
- [ ] `MARCAR COMO LISTO` mueve el pedido a la columna Listo y actualiza los tres contadores y el badge `Pedidos 18`.
- [ ] `CANCELAR PEDIDO` retira el pedido del tablero sin diálogo de confirmación y actualiza los contadores.
- [ ] Cada cambio de estado dispara el toast; este se cierra solo a los 7 s o con su ✕, y tiene `aria-live="polite"`.
- [ ] El resaltado `ACTUALIZADO AHORA` + borde rojo pasa al último pedido actualizado y desaparece a los ~5 s (inicialmente en `#1043`).
- [ ] El timer avanza un pedido cada ~15 s; con `prefers-reduced-motion: reduce` no se crea ningún intervalo.
- [ ] `SINCRONIZADO HACE N S` sube cada segundo y se reinicia con cada sincronización.
- [ ] La búsqueda filtra por ID y comensal, el select filtra por canal, y ambos muestran `SIN RESULTADOS PARA «…»` cuando no hay coincidencias.
- [ ] Una columna vacía muestra `SIN PEDIDOS EN ESTA COLUMNA`.
- [ ] Los tabs `Productos` y `Ajustes` y el botón imprimir no navegan ni ejecutan acciones.
- [ ] Con `#1043`, el desglose da Subtotal `48,00 €`, IVA inc. (10%) `4,80 €` y Total `52,80 €`; la nota de cocina no se renderiza en pedidos sin `note`.
- [ ] La fila «Pedidos en tiempo real» de la landing navega a `/demos/pedidos` y el overlay de menú también.
- [ ] La demo se muestra en Paper con la preferencia del tema en `dark` (fuerza SPEC 05) y no aparece ninguna clase `dark:` de Tailwind.
- [ ] Las capturas a 1440px y 390px no muestran desviaciones respecto a `screen.png` y viven en `.playwright-mcp/06-demo-pedidos-tiempo-real/after/`.

## Decisiones

- **Sí:** 18 pedidos mock con contadores derivados. **No:** listas cortas con contadores fijos — mentirían al mover tarjetas.
- **Sí:** tabs `Productos`/`Ajustes` inertes. **No:** diseñar dos vistas sin referencia (sería una pantalla nueva dentro de esta spec).
- **Sí:** búsqueda y filtro funcionales con estado vacío. **No:** inertes — SPEC 05 rechazó los affordances falsos.
- **Sí:** transiciones sin diálogo de confirmación, comunicadas por toast. **No:** modal de confirmación en una demo con datos ficticios.
- **Sí:** timer determinista de ~15 s (avanza el primero de la columna origen) con `prefers-reduced-motion`. **No:** selección aleatoria ni WebSockets — no serían verificables.
- **Sí:** `badge` como campo del mock, sustituido por el por defecto de la columna destino al avanzar. **No:** derivarlo solo de la columna — perdería `EN HORNO` y `EMPAQUETANDO`.
- **Sí:** el resaltado `ACTUALIZADO AHORA` sigue al último cambio. **No:** fijo en `#1043` del mock.
- **Sí:** sin persistencia (estado en memoria, reset al recargar), como SPEC 04. **No:** `localStorage` para una demo.
- **Sí:** reutilizar `stagger-in` y `count-up`, con CSS propio para el pulso y el toast. **No:** ampliar el switch de `ScrollAnimations` (evita regresiones en la landing de SPEC 01/05).
- **Sí:** shell propio en `app/demos/pedidos/`. **No:** refactorizar leads a un `DemoChrome` compartido — tocaría una demo ya verificada.
- **Sí:** dos campos `channel` (filtro) y `place` (pie de tarjeta). **No:** un solo campo — el select y el pie no cubren los mismos valores en la referencia.
- **Sí:** nota de cocina opcional (`note?`) e imprimir inerte. **No:** fabricar notas para los 18 pedidos ni una impresión simulada.
- **Sí:** IVA calculado desde los artículos (precio con IVA incluido). **No:** los números incoherentes del resto de tarjetas de la referencia (`#1043` sí cuadra: 48,00 + 4,80 = 52,80).
- **Sí:** `ageLabel` estático del mock. **No:** simulación de envejecimiento de tiempos, que añade estado sin valor demostrable.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El timer choca con la hidratación SSR | Componente cliente con `useEffect`; el HTML inicial trae los 18 pedidos mock |
| Cancelar o mover pedidos deja columnas vacías | Estado vacío definido (`SIN PEDIDOS EN ESTA COLUMNA`) y reselección del primer pedido visible |
| Redondeos de IVA descuadran los totales | Cálculo centralizado en una función del shell; aceptación con los valores exactos de `#1043` |
| 18 tarjetas desbordan el diseño de la referencia | QA visual a 1440px y 390px contra `screen.png` |
| El contador `18` del tab y la franja divergen tras cancelar | Ambos derivados del mismo array `orders` |

## Lo que **no** está en esta spec

- Vistas `Productos` y `Ajustes`, backend real/WebSockets y persistencia.
- Drag & drop, impresión real e i18n.
- Pantalla 04 (Software de gestión), resto de pantallas y deploy.
