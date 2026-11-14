# Spec Delta

## Purpose

Esta capacidad ofrece una superficie pública y verificable para inspeccionar, simular y desplegar localmente un workflow mock de ingestión y cualificación de leads.

## ADDED Requirements

### Requirement: Superficie pública de orquestación
La ruta `/es/demos/leads-workflow` SHALL renderizar una superficie operativa completa sin exigir sesión ni rol.

#### Scenario: Usuario anónimo abre la demo
- **WHEN** un usuario visita `/es/demos/leads-workflow`
- **THEN** ve el shell de la demo sin redirección, error de runtime ni requisito de autenticación

#### Scenario: Shell operativo visible
- **WHEN** la ruta termina de renderizar
- **THEN** muestra header fijo, command bar, telemetría, presets, canvas, registro lateral y footer operativo

### Requirement: Pipeline visual determinista
El canvas SHALL mostrar nodos de ingestión, análisis IA, CRM/Postgres y notificación con conexiones ortogonales, terminales y metadata técnica mock.

#### Scenario: Pipeline inicial
- **WHEN** el workspace se carga con fixtures seguros
- **THEN** aparecen nodos y conexiones visibles con estados operativos reproducibles

#### Scenario: Controles de layout
- **WHEN** el usuario usa zoom, `RESET GRID` o `AUTO-ALIGN`
- **THEN** cambia la escala o se restauran posiciones deterministas sin alterar leads, eventos ni despliegue

### Requirement: Presets y acciones de runtime
Los presets y acciones visibles SHALL producir transiciones deterministas y feedback accesible.

#### Scenario: Selección de preset
- **WHEN** el usuario selecciona cualquiera de `EN VIVO`, `PROCESANDO EVENTO`, `ENRUTAMIENTO CRÍTICO` o `VISTA MATRIX (DEBUG)`
- **THEN** el runtime y la UI reflejan ese preset sin llamadas externas

#### Scenario: Simulación de disparo
- **WHEN** el usuario activa `[ SIMULAR DISPARO ]`
- **THEN** el pipeline mock avanza por etapas, actualiza un lead y añade eventos de auditoría al registro

#### Scenario: Ejecución de test
- **WHEN** el usuario activa `[ EJECUTAR TEST ]`
- **THEN** se muestra una traza determinista con estado de nodos y latencias mock en una región viva

#### Scenario: Alta de nodo
- **WHEN** el usuario activa `[ + AÑADIR NODO ]`
- **THEN** se añade el siguiente fixture permitido en una posición determinista y el cambio queda registrado localmente

### Requirement: Registro de leads y filtros
El registro SHALL mostrar cuatro leads iniciales con detalle operativo y permitir combinar filtros por estado, score ICP y origen.

#### Scenario: Registro inicial
- **WHEN** el usuario abre la demo
- **THEN** puede inspeccionar cuatro leads con nombre, rol, empresa, score ICP, origen, estado, owner y eventos

#### Scenario: Filtros combinados
- **WHEN** el usuario combina filtros de estado, score ICP y origen
- **THEN** el registro muestra únicamente los leads coincidentes sin llamadas externas

#### Scenario: Resultado vacío
- **WHEN** ningún lead coincide con los filtros
- **THEN** aparece un estado vacío accesible y una acción para recuperar el registro

#### Scenario: Inspector móvil
- **WHEN** el viewport es de 375px
- **THEN** el canvas aparece antes que el registro y el registro se abre y cierra mediante un drawer accesible

### Requirement: Despliegue local validado
`[ DESPLEGAR FLUJO ]` SHALL validar el workflow y generar una versión local determinista únicamente si la configuración es válida.

#### Scenario: Despliegue válido
- **WHEN** el workflow tiene nombre, revisión, ingestión, procesamiento, salida y conexiones válidas
- **THEN** se genera una versión local, el estado pasa a desplegado y se muestra confirmación mock

#### Scenario: Despliegue inválido
- **WHEN** falta un nodo o una conexión requerida
- **THEN** el despliegue no cambia el estado, se muestran errores en una región accesible y el usuario puede corregirlo

### Requirement: Persistencia y recuperación segura
La demo SHALL persistir un snapshot versionado y restaurar fixtures seguros ante snapshots corruptos, incompatibles o ilegibles.

#### Scenario: Recarga con snapshot válido
- **WHEN** el usuario recarga tras cambiar workflow, leads, eventos, preset, filtros o despliegue
- **THEN** la demo recupera esos valores desde `localStorage`

#### Scenario: Snapshot inválido
- **WHEN** el snapshot no se puede parsear o no cumple el esquema esperado
- **THEN** se descarta, se restauran fixtures seguros y se muestra feedback no bloqueante

### Requirement: Contratos mock aislados
Los contratos de repositorio, runtime y despliegue SHALL ser independientes de React, `localStorage` y proveedores externos.

#### Scenario: Consumo por la UI
- **WHEN** un componente ejecuta una operación del workflow
- **THEN** consume un contrato mock y no accede directamente a fixtures, `localStorage` ni red

#### Scenario: Entorno sin red
- **WHEN** se ejecuta la demo o su suite con la red deshabilitada
- **THEN** las operaciones mock siguen siendo deterministas y no intentan usar proveedores reales

### Requirement: Accesibilidad y movimiento reducido
La interfaz SHALL ofrecer nombres accesibles, foco visible, teclado, regiones vivas, cierre accesible del drawer y respeto de `prefers-reduced-motion`.

#### Scenario: Operación con teclado
- **WHEN** el usuario navega solo con teclado
- **THEN** puede alcanzar y activar controles, distinguir el foco y cerrar el drawer con `Escape`

#### Scenario: Movimiento reducido
- **WHEN** el usuario tiene `prefers-reduced-motion: reduce`
- **THEN** las transiciones y animaciones no introducen movimiento perceptible innecesario
