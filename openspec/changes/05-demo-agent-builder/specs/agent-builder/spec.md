# Spec Delta

## Purpose

La capability Agent Builder permite configurar y demostrar un agente técnico mediante una superficie visual completa, con runtime determinista y contratos preparados para sustituir los mocks por servicios de producción.

## ADDED Requirements

### Requirement: Configuración editable del agente

El sistema MUST permitir editar los parámetros visibles de configuración del agente y reflejar los cambios en la superficie sin recargar la página.

#### Scenario: Actualización de parámetros
- **WHEN** el usuario modifica el identificador, modelo, temperatura, personalidad o prompt
- **THEN** la configuración visible se actualiza y queda marcada como pendiente de sincronización

### Requirement: Gestión de conectores

El sistema MUST permitir activar y desactivar conectores mock y mostrar cuántos están activos.

#### Scenario: Activar un conector
- **WHEN** el usuario activa un conector disponible
- **THEN** el conector cambia a activo y el contador refleja el nuevo total

### Requirement: Gestión de fuentes de conocimiento

El sistema MUST permitir añadir y eliminar fuentes mock de tipo `FILE` o `URL` sin acceder a recursos externos.

#### Scenario: Añadir fuente local
- **WHEN** el usuario registra una fuente con tipo y referencia válidos
- **THEN** la fuente aparece en la lista local sin realizar ninguna petición de red

#### Scenario: Eliminar fuente local
- **WHEN** el usuario elimina una fuente existente
- **THEN** la fuente desaparece y el estado de configuración se actualiza

### Requirement: Validación antes del despliegue

El sistema MUST validar los campos obligatorios y exigir al menos un conector activo antes de cambiar el agente a desplegado.

#### Scenario: Configuración inválida
- **WHEN** el usuario intenta desplegar una configuración incompleta
- **THEN** se muestran errores junto a los campos afectados y el agente no cambia a `deployed`

#### Scenario: Configuración válida
- **WHEN** el usuario intenta desplegar una configuración completa con un conector activo
- **THEN** el sistema confirma el despliegue mock, asigna una versión local y muestra el estado `deployed`

### Requirement: Runtime determinista

El sistema MUST permitir enviar prompts y representar respuestas, estados, latencia, consumo y trazas mediante fixtures deterministas locales.

#### Scenario: Ejecutar prompt
- **WHEN** el usuario envía un prompt escrito o selecciona un prompt rápido
- **THEN** se añade el mensaje del operador y se muestra una respuesta mock con telemetría estable

#### Scenario: Seleccionar estado operativo
- **WHEN** el usuario selecciona `idle`, `typing`, `error` o `deployed` en la matriz de estados
- **THEN** el runtime muestra la representación correspondiente sin llamar a un servicio externo

### Requirement: Reinicio de conversación

El sistema MUST permitir reiniciar el hilo de conversación sin eliminar la configuración del agente.

#### Scenario: Reiniciar hilo
- **WHEN** el usuario pulsa reiniciar conversación
- **THEN** se eliminan los mensajes del hilo y permanecen la configuración, conectores y fuentes

### Requirement: Persistencia mock segura

El sistema MUST persistir el workspace en `localStorage` mediante una clave versionada y MUST recuperar fixtures seguros si el snapshot no es válido.

#### Scenario: Recarga con snapshot válido
- **WHEN** el usuario recarga la ruta después de editar la configuración
- **THEN** el workspace se hidrata con la última configuración válida

#### Scenario: Snapshot inválido
- **WHEN** el almacenamiento contiene JSON corrupto o datos incompatibles
- **THEN** el sistema descarta el snapshot, recupera fixtures seguros y mantiene la ruta operativa

### Requirement: Acceso protegido y accesibilidad

El sistema MUST conservar el acceso para `admin`, `editor` y `revisor`, bloquear usuarios sin sesión y ofrecer controles accesibles y responsive.

#### Scenario: Usuario sin sesión
- **WHEN** un usuario no autenticado visita la ruta
- **THEN** se muestra el estado de sesión requerida y no se expone el constructor

#### Scenario: Uso con teclado y viewport móvil
- **WHEN** el usuario navega con teclado a 375px de ancho
- **THEN** los controles mantienen foco visible, nombres accesibles, feedback anunciable y paneles utilizables

### Requirement: Frontera preparada para producción

El sistema MUST exponer contratos independientes para repositorio, validación y runtime, y MUST implementar únicamente adaptadores mock en esta fase.

#### Scenario: Ejecución sin servicios externos
- **WHEN** la aplicación se ejecuta sin credenciales ni variables de proveedores
- **THEN** la demo funciona con fixtures locales y no realiza llamadas remotas

