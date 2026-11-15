# Spec Delta

## Purpose

Ofrece una demo pública y reproducible de pedidos, cocina y eventos realtime con datos mock deterministas, persistencia local segura y una frontera desacoplada para una futura integración de producción.

## ADDED Requirements

### Requirement: Superficie pública de pedidos realtime

La ruta `/es/demos/orders-realtime` SHALL estar disponible para usuarios anónimos y autenticados sin exigir sesión, rol nuevo ni llamadas de red.

#### Scenario: Acceso público
- **WHEN** una persona abre `/es/demos/orders-realtime` sin sesión
- **THEN** la demo se renderiza sin redirección ni error de autorización

#### Scenario: Frontera local
- **WHEN** la demo carga o ejecuta una acción
- **THEN** utiliza fixtures y adaptadores locales sin HTTP ni proveedores externos

### Requirement: Workspace inicial determinista

El workspace SHALL mostrar los seis pedidos de referencia y los valores iniciales de pedidos, ventas, preparación, ticket y conexión sin depender del reloj ni de aleatoriedad.

#### Scenario: Pedidos iniciales
- **WHEN** no existe un snapshot válido
- **THEN** se muestran `B-842` de Elena R., `B-841` de David S., `B-839` de Marcus V., `B-840` de Laura C., `B-838` de Sofia B. y `B-837` de Carlos M. con sus estados, productos, importes y metadata de referencia

#### Scenario: KPIs iniciales
- **WHEN** se carga el workspace seguro
- **THEN** muestra `312` pedidos hoy, `7.737,60 €` de ventas en vivo, `8m 42s` de preparación media, `24,80 €` de ticket medio y conexión `24ms`

### Requirement: Carrito y emisión de pedidos

La demo SHALL permitir modificar cantidades enteras no negativas, recalcular importes con IVA del 10% y emitir un pedido mock en estado `NUEVO`.

#### Scenario: Carrito inicial
- **WHEN** se carga el panel de cliente sin snapshot válido
- **THEN** contiene una unidad de `SMASH DOBLE MADURADA`, una de `PATATAS CORTE FINO TRUFADAS` y una de `KOMBUCHA ARTESANA // LIMA`, con subtotal `22,10 €`, IVA `2,21 €` y total `24,31 €`

#### Scenario: Cantidad no negativa
- **WHEN** una persona reduce a cero un producto o intenta reducirlo por debajo de cero
- **THEN** la cantidad queda en un entero mayor o igual que cero y los importes se recalculan sin valores negativos

#### Scenario: Emisión idempotente por activación
- **WHEN** se activa `ENVIAR PEDIDO [ PEDIR ↵ ]`
- **THEN** se crea un identificador único en `NUEVO`, se actualizan pedidos y ventas y se añade un único evento determinista `WSS:IN` para esa emisión

### Requirement: Transiciones del tablero KDS

El tablero SHALL mostrar las columnas `NUEVO`, `EN PLANCHA` y `LISTO` y SHALL aceptar únicamente las transiciones ordenadas del ciclo de un pedido.

#### Scenario: Avance de cocina
- **WHEN** se avanza un pedido nuevo y después un pedido en plancha
- **THEN** sus estados pasan respectivamente de `new` a `cooking` y de `cooking` a `ready`, con la acción visible correspondiente

#### Scenario: Entrega y archivado
- **WHEN** se entrega un pedido listo o se retira un pedido ya entregado
- **THEN** el pedido pasa por `delivered` a `archived` sin romper el workspace

#### Scenario: Acción repetida
- **WHEN** se repite una acción sobre un pedido que ya alcanzó el estado solicitado
- **THEN** no se crean eventos duplicados y el estado permanece estable

### Requirement: Estado realtime del cliente

La emulación del cliente SHALL representar `CONFIRMADO`, `PREPARANDO TU PEDIDO` y `¡LISTO PARA RECOGER!` con progreso reproducible.

#### Scenario: Progreso del pedido
- **WHEN** se activa `→ LISTO`, `→ PLANCHA` o `→ NUEVO`
- **THEN** el estado del cliente y su barra de progreso se actualizan de forma determinista al estado correspondiente

### Requirement: Conexión y escenarios mock

La demo SHALL implementar los estados `CONECTADO`, `RECONECTANDO` y `OFFLINE`, además de los cuatro escenarios de la referencia, sin reloj real ni números aleatorios.

#### Scenario: Estado de conexión
- **WHEN** se selecciona `CONECTADO`, `RECONECTANDO` u `OFFLINE`
- **THEN** se actualizan la etiqueta, el icono, la latencia fixture y el evento técnico correspondiente

#### Scenario: Escenarios disponibles
- **WHEN** se activa `EN VIVO (SINCRONIZADO)`, `NUEVO PEDIDO ENTRANTE (✦)`, `COCINA EN HORA PUNTA` o `LATENCIA ALTA (RECONECTANDO)`
- **THEN** el workspace y el registro muestran los estados, pedidos y eventos mock definidos para ese escenario de forma reproducible

### Requirement: Stream de eventos

El stream SHALL permitir pausar y reanudar la recepción, limpiar el buffer y filtrar por identificador, conservando como máximo 40 eventos.

#### Scenario: Pausa y reanudación
- **WHEN** se pausa el stream y se ejecuta una simulación
- **THEN** no se añaden eventos automáticos al buffer hasta reanudarlo, mientras las operaciones de negocio siguen actualizando el workspace

#### Scenario: Limpieza del buffer
- **WHEN** se limpia el stream
- **THEN** el buffer queda vacío y muestra el mensaje de reinicio definido por la referencia en una región accesible

#### Scenario: Filtro por identificador
- **WHEN** se introduce un identificador de pedido en el filtro
- **THEN** solo se muestran los eventos coincidentes y se conservan los controles del terminal

### Requirement: Persistencia y recuperación segura

La demo SHALL persistir el workspace mediante un snapshot versionado y SHALL recuperar fixtures seguros con fallback en memoria ante datos inválidos o almacenamiento no disponible.

#### Scenario: Restauración válida
- **WHEN** se recarga la ruta después de modificar pedidos, carrito, KPIs, conexión, escenario o eventos
- **THEN** se restauran los datos del snapshot compatible

#### Scenario: Snapshot inválido
- **WHEN** el snapshot tiene versión incompatible, campos ausentes, ids repetidos, estados no permitidos, cantidades negativas, importes no finitos o eventos incompletos
- **THEN** se descarta el snapshot, se restauran fixtures seguros y se muestra feedback no bloqueante y accesible

#### Scenario: Almacenamiento no disponible
- **WHEN** `localStorage` no puede leerse o escribirse
- **THEN** la demo continúa en memoria con fixtures seguros y anuncia el fallback sin bloquear las operaciones locales

### Requirement: Contratos desacoplados

El dominio SHALL exponer contratos independientes de React, `localStorage` y proveedores externos para repositorio, transporte realtime y runtime.

#### Scenario: Adaptador local sustituible
- **WHEN** un componente solicita datos o ejecuta una acción
- **THEN** consume el contrato correspondiente y no accede directamente a fixtures, almacenamiento ni proveedores externos

#### Scenario: Transporte local
- **WHEN** se publica o suscribe un evento realtime mock
- **THEN** el transporte local entrega el evento de forma determinista y permite sustituir posteriormente el proveedor sin cambiar la composición

### Requirement: Composición visual de referencia

La superficie SHALL conservar tema oscuro, tipografías, tokens, hairlines, geometría cuadrada, densidad editorial y acento naranja limitado, e incluir las regiones principales de la referencia.

#### Scenario: Composición completa
- **WHEN** se abre la demo en escritorio
- **THEN** se muestran navegación técnica, estado de conexión, simulador, cuatro KPIs, panel de cliente, separador full-duplex, KDS, stream de eventos y footer operativo

### Requirement: Responsive y accesibilidad

La UI SHALL funcionar a 375px y 1440px sin overflow horizontal de página y SHALL ofrecer nombres accesibles, foco visible, teclado, regiones vivas y movimiento reducido.

#### Scenario: Vista móvil
- **WHEN** la demo se abre a 375px
- **THEN** funcionan las pestañas `{ CLIENTE } // ORDEN` y `{ COCINA } // KDS`, se conservan los controles principales y el estado persiste al cambiar de vista

#### Scenario: Vista escritorio
- **WHEN** la demo se abre a 1440px
- **THEN** se conserva la composición completa sin pérdida de controles ni desbordamiento horizontal de página

#### Scenario: Teclado y feedback
- **WHEN** una persona navega por teclado o una operación cambia el workspace
- **THEN** los controles tienen nombre y foco visibles y el resultado se anuncia en una región viva accesible

#### Scenario: Movimiento reducido
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** las animaciones se eliminan o suavizan sin perder información ni funcionalidad

### Requirement: Boundary de dependencias y producción

La demo MUST mantener todas las operaciones en mocks locales y no MUST añadir dependencias nuevas ni integraciones remotas.

#### Scenario: Sin proveedores reales
- **WHEN** se ejecutan los flujos de pedidos, cocina, conexión o stream
- **THEN** no se realizan llamadas a Supabase, WebSocket, SSE, APIs propias ni proveedores de comunicación o pagos

#### Scenario: Dependencias existentes
- **WHEN** se instala y construye el proyecto
- **THEN** la implementación usa las dependencias actuales y no modifica el contrato de despliegue para añadir una librería realtime
