# Spec Delta

## Purpose

La capability ofrece una demo pública de backoffice empresarial fiel a la referencia, con datos mock deterministas, operaciones locales completas, roles visuales y una experiencia accesible y responsive. Debe servir como demostración aislada y dejar una frontera sustituible para una integración futura sin conectar proveedores reales.

## ADDED Requirements

### Requirement: Superficie pública fiel a la referencia
La ruta `/es/demos/business-backoffice` SHALL mostrar una superficie de backoffice pública, operativa y sin autenticación real, con tema oscuro, tipografías editoriales y monoespaciadas, hairlines, geometría cuadrada, alta densidad y acento naranja limitado.

#### Scenario: Carga pública de la demo
- **WHEN** una persona visita `/es/demos/business-backoffice` sin sesión
- **THEN** la superficie se renderiza sin redirección, error de runtime ni llamada de red

#### Scenario: Composición de referencia
- **WHEN** la superficie se muestra en escritorio
- **THEN** incluye cabecera técnica, navegación lateral, canvas central, búsqueda `FIND_SYS`, periodo, sincronización y selector de roles con la jerarquía visual de la referencia

### Requirement: Fixtures iniciales deterministas
La demo SHALL iniciar con métricas, pedidos, clientes, facturas, stock, auditoría y series de facturación deterministas, con importes almacenados sin pérdida de precisión y formateados como euros.

#### Scenario: Métricas y serie iniciales
- **WHEN** se carga el workspace inicial
- **THEN** muestra `48.290,00 €`, `642`, `75,20 €`, `118` y la serie de febrero `8.420 €`, `10.980 €`, `12.000 €`, `16.890 €`, comparada con enero `39.450 €`

#### Scenario: Pedidos, facturas, stock y drawer iniciales
- **WHEN** se carga el workspace inicial
- **THEN** muestra los pedidos `#ORD-9042` a `#ORD-9038`, las facturas `FAC-2025-089`, `FAC-2025-088`, `FAC-2025-084`, las tres alertas de stock y el expediente `CLI-8841` con los valores definidos en la referencia

### Requirement: Métricas y periodos operativos
La demo SHALL mostrar cuatro KPIs, permitir cambiar entre febrero y enero de 2025 y representar la comparativa de facturación mediante una gráfica SVG determinista.

#### Scenario: Cambio de periodo
- **WHEN** se selecciona el periodo enero de 2025
- **THEN** los KPIs y la serie visible cambian a los fixtures de enero sin usar reloj real ni aleatoriedad

#### Scenario: Estado de esqueletos
- **WHEN** se activa `ESQUELETOS`
- **THEN** se ocultan los valores reales de métricas y gráfica hasta volver a `EN VIVO`

### Requirement: Búsqueda y paginación de pedidos
La tabla de pedidos SHALL buscar por ID, cliente, empresa, artículo o estado normalizando mayúsculas, minúsculas y acentos, y SHALL conservar una página válida cuando cambie el conjunto filtrado.

#### Scenario: Búsqueda normalizada
- **WHEN** se introduce una consulta equivalente con otra capitalización o sin acentos
- **THEN** aparecen los pedidos coincidentes sin llamadas externas

#### Scenario: Filtro que reduce páginas
- **WHEN** el filtro reduce el total de pedidos mientras se está en una página posterior
- **THEN** la tabla vuelve a la última página válida y muestra los metadatos actualizados

### Requirement: Gestión de pedidos y exportación CSV
La demo SHALL permitir registrar un pedido manual validado y descargar localmente los pedidos visibles o filtrados como CSV con cabecera estable y escaping correcto.

#### Scenario: Pedido manual válido
- **WHEN** un rol autorizado envía cliente, al menos un artículo, cantidades enteras positivas e importe válido
- **THEN** se crea el pedido mock, se actualizan las métricas, se añade un evento de auditoría y se muestra feedback accesible

#### Scenario: Pedido manual inválido
- **WHEN** falta el cliente, no hay artículos, una cantidad no es positiva o el importe no es válido
- **THEN** la operación se rechaza, se conservan los datos anteriores y se anuncian los errores sin enviar red

#### Scenario: Exportación filtrada
- **WHEN** se activa `EXPORTAR CSV`
- **THEN** se descarga un archivo local con los pedidos del filtro actual, cabecera estable y campos con comas, comillas o saltos de línea correctamente escapados

### Requirement: Roles y autorización mock
La demo SHALL ofrecer los roles `ADMIN`, `EDITOR` y `LECTOR` mediante una política reutilizable; `ADMIN` y `EDITOR` pueden mutar y `LECTOR` solo puede consultar, cambiar simulación, periodo o búsqueda.

#### Scenario: Cambio de rol
- **WHEN** se selecciona un rol
- **THEN** el badge, el aviso y el estado habilitado de las acciones reflejan ese rol de forma determinista

#### Scenario: Mutación bloqueada en lector
- **WHEN** `LECTOR` intenta registrar, emitir, editar, actualizar stock o exportar
- **THEN** la operación no modifica el workspace, aparece el aviso de acceso restringido y se informa del motivo mediante feedback accesible

### Requirement: Expediente de cliente y drawer
La demo SHALL abrir el expediente del cliente correcto desde `[ VER ]`, mostrar identidad, métricas, historial y notas, y permitir editarlo o ejecutar acciones autorizadas con cancelación y control de foco.

#### Scenario: Apertura del expediente
- **WHEN** se pulsa `[ VER ]` en un pedido
- **THEN** se abre el drawer del cliente asociado con sus datos, historial y notas internas sin cambiar el pedido seleccionado

#### Scenario: Edición válida y cancelación
- **WHEN** un rol autorizado edita nombre, email y notas con datos válidos
- **THEN** se guarda el expediente y se registra feedback; si cancela, se conserva el estado anterior

### Requirement: Facturas pendientes e idempotencia
La demo SHALL mostrar facturas pendientes con estados `VENCE EN 3D`, `VENCE HOY` y `VENCIDA`, y SHALL permitir emitirlas o reclamarlas únicamente a roles autorizados.

#### Scenario: Emisión de factura
- **WHEN** un rol autorizado emite una factura pendiente
- **THEN** cambia su estado, se registra un evento de auditoría y se muestra el aviso de emisión

#### Scenario: Emisión repetida
- **WHEN** se intenta emitir una factura ya emitida
- **THEN** no se duplica la operación ni el evento y el workspace mantiene un resultado coherente

### Requirement: Alertas y actualización de stock
La demo SHALL mostrar SKU, producto, cantidad, mínimo, barra y severidad de cada alerta, y SHALL recalcular la severidad después de una actualización válida.

#### Scenario: Actualización válida
- **WHEN** un rol autorizado actualiza una cantidad no negativa
- **THEN** se recalculan cantidad y severidad, se registra la operación y se actualiza la alerta visible

#### Scenario: Cantidad negativa
- **WHEN** se intenta actualizar stock con una cantidad negativa
- **THEN** se rechaza la operación, no cambia el workspace y se anuncia el error

### Requirement: Estados reproducibles del simulador
La demo SHALL soportar `EN VIVO`, `DRAWER CLIENTE`, `MODO LECTOR`, `TOAST EMITIDO`, `ESQUELETOS` y `TABLA VACÍA` como estados reproducibles y restaurables.

#### Scenario: Activación de estados
- **WHEN** se activa cualquiera de los estados del simulador
- **THEN** la vista muestra exactamente el estado correspondiente, incluyendo drawer de `CLI-8841`, rol lector, toast, esqueletos o tabla vacía

#### Scenario: Recuperación desde tabla vacía
- **WHEN** se activa `TABLA VACÍA` y se pulsa su acción de reinicio
- **THEN** se recupera la vista operativa sin perder las mutaciones persistidas

#### Scenario: Toast accesible
- **WHEN** se activa `TOAST EMITIDO`
- **THEN** el mensaje aparece en una región viva, puede cerrarse y no depende de temporizadores aleatorios

### Requirement: Persistencia y recuperación segura
La demo SHALL persistir rol, simulación, periodo, búsqueda, página, clientes, pedidos, facturas, stock y auditoría en un snapshot versionado, y SHALL recuperar fixtures seguros ante snapshots inválidos.

#### Scenario: Restauración válida
- **WHEN** se recarga la ruta después de una mutación válida
- **THEN** se restauran los cambios y el estado del workspace desde el snapshot compatible

#### Scenario: Snapshot corrupto o incompatible
- **WHEN** el snapshot falta, no se puede leer, tiene otra versión o no supera la validación de estructura, estados, IDs, importes y colecciones
- **THEN** se cargan fixtures seguros y se muestra feedback no bloqueante y accesible

#### Scenario: Almacenamiento no disponible
- **WHEN** `localStorage` no está disponible o no permite escribir
- **THEN** la demo continúa operativa en memoria y comunica la limitación sin bloquear la navegación

### Requirement: Frontera de contratos sustituible
La capability SHALL mantener separadas de la UI las reglas de dominio, permisos, repositorio, runtime y exportación CSV, de forma que el adaptador local pueda sustituirse sin cambiar la composición ni las reglas de negocio.

#### Scenario: Operación a través de contratos
- **WHEN** la UI consulta o modifica el workspace
- **THEN** la operación se resuelve mediante la frontera local definida y no accede directamente a fixtures, almacenamiento o proveedores externos

#### Scenario: Sin integración remota
- **WHEN** se ejecutan las operaciones de la demo
- **THEN** no se realizan llamadas de red ni se conectan Supabase, APIs, CRM, ERP, Stripe, email u otros proveedores reales

### Requirement: Auditoría determinista
La demo SHALL registrar eventos de pedidos, facturas, stock, cambios de rol y exportaciones con actor, mensaje, hora fixture y tono visible.

#### Scenario: Evento de mutación
- **WHEN** se completa una mutación autorizada
- **THEN** aparece un evento único en el audit log con el tipo, actor y mensaje correspondientes

#### Scenario: Evento de rol y exportación
- **WHEN** se cambia el rol o se exportan pedidos
- **THEN** se registra el evento correspondiente y se conserva tras recargar si el snapshot es válido

### Requirement: Responsive y accesibilidad
La UI SHALL funcionar a 375px y 1440px sin overflow horizontal, con nombres accesibles, foco visible, teclado, cierre del drawer con `Escape`, restauración del foco y regiones vivas.

#### Scenario: Vista móvil
- **WHEN** se visita la ruta con un viewport de 375px
- **THEN** la información se reorganiza sin overflow horizontal y las acciones principales siguen disponibles

#### Scenario: Teclado y drawer
- **WHEN** una persona navega con teclado, abre el drawer y pulsa `Escape`
- **THEN** los controles tienen foco visible, el drawer conserva el foco mientras está abierto, se cierra y devuelve el foco al control de origen

#### Scenario: Movimiento reducido
- **WHEN** el sistema indica `prefers-reduced-motion: reduce`
- **THEN** las transiciones y animaciones se reducen o eliminan sin perder información ni funcionalidad

### Requirement: Verificación del cambio
La implementación SHALL mantener los quality gates del proyecto y la trazabilidad entre requisitos, tareas, pruebas y verificaciones antes de considerarse completa.

#### Scenario: Quality gates locales
- **WHEN** se ejecutan `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `openspec validate 09-demo-business-backoffice --strict`
- **THEN** cada comando termina correctamente y existe evidencia de su resultado

#### Scenario: Cobertura de requisitos
- **WHEN** se revisa la trazabilidad del cambio
- **THEN** cada requisito tiene tareas, pruebas y una verificación independiente o queda explícitamente pendiente con motivo
