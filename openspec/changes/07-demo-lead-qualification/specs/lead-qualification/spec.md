# Spec Delta

## Purpose

La capacidad ofrece una demo pública, reproducible y accesible para cualificar leads con un workspace mock persistente, acciones de seguimiento y contratos desacoplados de cualquier proveedor externo.

## ADDED Requirements

### Requirement: Superficie pública de cualificación
La ruta `/es/demos/lead-qualification` SHALL estar disponible para usuarios anónimos y autenticados sin exigir sesión, rol nuevo ni llamadas de red.

#### Scenario: Acceso público
- **WHEN** una persona abre `/es/demos/lead-qualification` sin sesión
- **THEN** la demo se renderiza sin redirección ni error de autorización

#### Scenario: Frontera mock
- **WHEN** la demo carga o ejecuta una acción
- **THEN** utiliza fixtures y adaptadores locales sin HTTP, CRM, LLM ni proveedor externo

### Requirement: Workspace inicial determinista
El workspace SHALL mostrar los cinco expedientes de referencia: Elena Rostova, Marcus Vance, Carlos Mendonça, Laura Chen y David Silva, con nombre, rol, empresa, score, tier, origen, metadatos técnicos y tiempo relativo deterministas.

#### Scenario: Carga inicial
- **WHEN** no existe un snapshot válido
- **THEN** se muestran exactamente los cinco leads fixture con sus datos mock deterministas

#### Scenario: Expediente seleccionado
- **WHEN** se selecciona cualquiera de los cinco leads
- **THEN** el expediente muestra contacto, teléfono, organización, presupuesto, mensaje, evaluación, recomendación, responsable y secuencia del lead

### Requirement: Búsqueda, filtros y selección
La bandeja SHALL permitir filtrar por `[ TODOS ]`, `[ CALIENTES ]`, `[ TEMPLADOS ]` y `[ FRÍOS ]`, buscar por nombre, empresa o puntuación y seleccionar un lead sin llamadas externas.

#### Scenario: Filtro por tier
- **WHEN** se activa uno de los filtros de tier
- **THEN** la bandeja muestra solo los leads del tier correspondiente y actualiza el recuento visible

#### Scenario: Búsqueda sin coincidencias
- **WHEN** la búsqueda no coincide con nombre, empresa ni puntuación
- **THEN** la bandeja muestra un estado vacío accesible y conserva los controles principales

#### Scenario: Selección reactiva
- **WHEN** se selecciona un lead visible
- **THEN** se actualiza el detalle central y la selección se conserva en el workspace

### Requirement: Estados reproducibles del simulador
El simulador SHALL producir los estados `EN VIVO (ESTÁNDAR)`, `CALIFICANDO EN DIRECTO`, `BANDEJA VACÍA` y `ESQUELETOS (SKELETONS)` de forma reproducible y con feedback no bloqueante en una región viva.

#### Scenario: Cambio de estado
- **WHEN** se activa cualquiera de los presets del simulador
- **THEN** la composición cambia al estado solicitado sin depender del reloj real, aleatoriedad ni red

#### Scenario: Estado de carga
- **WHEN** se activa `ESQUELETOS (SKELETONS)`
- **THEN** se muestran esqueletos accesibles sin presentar datos como definitivos

### Requirement: Acciones de lead y validación
La demo SHALL implementar `APROBAR ACCIÓN`, `REASIGNAR` y `EDITAR RESPUESTA`; aprobar exige lead seleccionado y respuesta no vacía, reasignar exige un responsable del catálogo local y editar rechaza contenido vacío o compuesto solo por espacios.

#### Scenario: Aprobación válida e idempotente
- **WHEN** se aprueba un lead seleccionado con respuesta mock no vacía
- **THEN** el lead se actualiza, se registra un despacho mock y una segunda activación no duplica el evento

#### Scenario: Reasignación
- **WHEN** se guarda un responsable del catálogo local en el diálogo de reasignación
- **THEN** el expediente muestra el nuevo responsable y cancelar no altera el workspace

#### Scenario: Edición de respuesta
- **WHEN** se guarda un borrador no vacío en el diálogo de respuesta
- **THEN** se conserva el borrador; si el contenido está vacío o contiene solo espacios se muestra un error accesible y no se guarda

### Requirement: Secuencia e inyección de lead de prueba
La demo SHALL permitir pausar y reanudar la secuencia del lead seleccionado y SHALL implementar `INYECTAR LEAD TEST` para añadir a Victor Kline con score 94 sin duplicados.

#### Scenario: Pausar y reanudar
- **WHEN** se alterna la secuencia del lead seleccionado
- **THEN** solo cambia el estado de secuencia de ese lead entre `running` y `paused`

#### Scenario: Inyección determinista
- **WHEN** se activa `INYECTAR LEAD TEST`
- **THEN** se muestra la calificación en directo y se añade Victor Kline con score 94 una sola vez

### Requirement: Persistencia local segura
El workspace SHALL persistir leads, selección, filtros, asignaciones, respuestas, secuencias, estado y eventos mediante un snapshot versionado; un snapshot inválido, incompatible, ilegible o un almacenamiento no disponible MUST recuperar fixtures seguros y mostrar feedback no bloqueante.

#### Scenario: Restauración válida
- **WHEN** se recarga la ruta después de modificar el workspace
- **THEN** se restauran los datos persistidos del snapshot compatible

#### Scenario: Recuperación segura
- **WHEN** el snapshot falla la validación o `localStorage` no está disponible
- **THEN** se cargan fixtures seguros con fallback en memoria y feedback no bloqueante

### Requirement: Contratos desacoplados
La capacidad SHALL exponer contratos independientes de React, `localStorage` y proveedores externos para obtener y actualizar el workspace, registrar eventos, seleccionar, cambiar estados, aprobar, reasignar, editar, alternar secuencias e inyectar leads.

#### Scenario: Adaptador sustituible
- **WHEN** un componente solicita datos o ejecuta una acción
- **THEN** consume el contrato de repositorio o runtime y no accede directamente a fixtures, almacenamiento ni proveedores

### Requirement: Composición responsive y accesible
La superficie SHALL conservar header fijo, command bar, simulador, cuatro KPIs, bandeja, expediente central, secuencia y footer; SHALL funcionar a 375px y 1440px sin desbordamiento horizontal y en móvil SHALL ofrecer las pestañas `BANDEJA`, `DETALLE` y `SEGUIMIENTO`.

#### Scenario: Viewport móvil
- **WHEN** la demo se abre a 375px
- **THEN** las pestañas móviles permiten cambiar entre bandeja, detalle y seguimiento, y seleccionar un lead abre su detalle

#### Scenario: Viewport escritorio
- **WHEN** la demo se abre a 1440px
- **THEN** se conserva la composición completa sin pérdida de controles ni overflow horizontal de página

#### Scenario: Teclado y diálogos
- **WHEN** una persona navega por teclado o abre un diálogo
- **THEN** los controles tienen nombre accesible y foco visible, el diálogo conserva foco, valida campos, cancela y se cierra con `Escape`

#### Scenario: Movimiento reducido
- **WHEN** `prefers-reduced-motion: reduce` está activo
- **THEN** las animaciones se eliminan o suavizan sin perder información ni funcionalidad

### Requirement: Dirección visual de referencia
La demo SHALL conservar la dirección brutalista editorial de la referencia: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.

#### Scenario: Composición visual
- **WHEN** se compara la demo con la referencia a 375px y 1440px
- **THEN** la jerarquía, densidad, geometría, tokens y acento naranja son reconocibles sin sustituirlos por un layout genérico
