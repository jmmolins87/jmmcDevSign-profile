# Design

## Context

La aplicación usa Next.js 16, React 19, TypeScript, Tailwind CSS, GSAP/ScrollTrigger, Lenis y mocks persistidos en `localStorage`. La superficie pública está organizada bajo `/es`; las cinco demos tienen dominios locales independientes y las specs 05–09 están implementadas. El canvas de Leads Workflow usa posiciones absolutas, tamaños porcentuales y fixtures que no validan colisiones antes de renderizarse.

## Goals / Non-Goals

**Goals:**

- Compartir la composición pública entre `/es` y `/en` sin duplicar páginas.
- Corregir el alineamiento del shell y completar el selector de temas.
- Mantener la navegación de demos estable durante el scroll.
- Incorporar un runtime de reproducción mock reutilizable sin compartir estados de negocio entre demos.
- Producir un layout de workflow verificable y una ejecución secuencial visualmente comprensible.
- Mantener accesibilidad, responsive, reduced motion y persistencia local segura.

**Non-Goals:**

- Conectar Supabase, APIs, WebSocket, SSE, pagos, correo real o proveedores de IA.
- Rediseñar por completo la dirección visual editorial existente.
- Compartir fixtures o snapshots entre demos.
- Añadir drag-and-drop libre de nodos en esta fase.
- Crear un área privada nueva para membresía.

## Decisions

### 1. Locale compartido

Se adoptará una frontera de locale compartida para landing, demos y autenticación, con un mapa de rutas equivalente y diccionarios tipados para `es` y `en`. Se conservarán las URLs españolas mediante compatibilidad explícita.

**Alternativa descartada:** duplicar `app/es` en `app/en`, porque produciría divergencia de componentes y duplicaría los tests.

### 2. Tema `dark | light | system`

El selector conservará una preferencia explícita en `localStorage`. Cuando la preferencia sea `system`, el runtime leerá `matchMedia("(prefers-color-scheme: dark)")`, reaccionará a cambios posteriores y publicará un cambio único para los consumidores visuales.

**Alternativa descartada:** consultar el sistema únicamente al cargar, porque no cumple el comportamiento reactivo solicitado.

### 3. Reproductor mock común

Se definirá un contrato de reproducción con estado `idle`, `running`, `paused` y `completed`, pasos ordenados, progreso y controles de reset. Cada demo adaptará sus propios pasos y efectos de dominio. Los relojes serán inyectables o controlables en tests; no se usarán datos aleatorios ni reloj real para decidir estados de negocio.

**Alternativa descartada:** implementar temporizadores independientes en cada panel, porque produciría comportamiento inconsistente y tests frágiles.

### 4. Layout de Leads Workflow

El layout inicial y `AUTO-ALIGN` usarán posiciones deterministas por capas/columnas, con separación mínima entre cajas. Antes de persistir o renderizar se validarán límites, IDs y colisiones. El canvas conservará scroll interno y escala, pero el tamaño efectivo de los nodos no dependerá de una combinación impredecible de porcentaje y coordenadas fixture.

**Alternativa descartada:** permitir el solapamiento y corregirlo solo con z-index, porque ocultaría información y rompería la lectura de aristas.

### 5. Ejecución secuencial del workflow

El runtime expondrá una secuencia de pasos derivada del grafo fixture. Cada paso actualizará nodo activo, arista activa, evento y estado final. La UI renderizará ese estado con clases de presentación y animará únicamente propiedades compositadas o stroke de SVG. Reduced motion conservará el orden y los estados, pero reducirá las transiciones.

**Alternativa descartada:** activar todos los nodos de una vez, porque no comunica el orden de ejecución solicitado.

### 6. Orders Realtime y drawer de Business Backoffice

Orders Realtime conservará su máquina de estados y añadirá una reproducción de entradas/transiciones sobre las operaciones existentes. Business Backoffice reutilizará el drawer de expediente ya definido, conectando `[ VER ]` con el identificador de cliente/pedido y restaurando foco al cerrar.

## Risks / Trade-offs

- [La migración a locale puede afectar imports y URLs] → Mantener aliases/rutas compatibles y cubrir enlaces equivalentes con E2E.
- [Los temporizadores pueden generar flakiness] → Usar reloj controlado, pasos deterministas y esperar estados, no pausas fijas.
- [El canvas puede desbordar en móvil] → Mantener scroll interno, límites de escala y pruebas a 375px y 1440px.
- [Las aristas pueden desincronizarse del layout] → Calcular puntos de conexión desde las posiciones validadas y probar cada edge fixture.
- [Snapshots antiguos pueden carecer de nuevos campos] → Versionar el snapshot, validar la estructura y recuperar fixtures seguros.
- [GSAP y reduced motion pueden competir] → Una única fuente de verdad por propiedad y limpieza completa de triggers/timelines.
- [El inglés puede dejar textos técnicos traducidos incorrectamente] → Mantener identificadores, nombres de producto y valores fixture como datos; traducir solo interfaz y mensajes.

## Migration Plan

1. Añadir la nueva estructura de locale y conservar `/es` como ruta compatible.
2. Añadir contratos y adaptadores de reproducción sin cambiar inicialmente los fixtures de negocio.
3. Migrar cada demo de forma independiente, manteniendo fallback de snapshots.
4. Ejecutar tests unitarios y de componentes por capability antes de integrar E2E.
5. Validar responsive, teclado, temas, locales y reduced motion en navegador.
6. Rollback: revertir la rama del change; no se requieren migraciones remotas ni cambios irreversibles de datos.

## Open Questions

Ninguna. Las decisiones de alcance, idioma, automatización, membresía, temas, layout y animación están cerradas en la spec.
