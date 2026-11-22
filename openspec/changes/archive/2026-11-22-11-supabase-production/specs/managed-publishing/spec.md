# Spec Delta

## Purpose

Esta capacidad proporciona membresía aprobada, autorización editorial, correo transaccional, revisiones persistentes y publicación pública para operar el portfolio en producción.

## ADDED Requirements

### Requirement: REQ-001 Identidad por email y sesión

El sistema SHALL permitir registro, confirmación de email, inicio de sesión, cierre de sesión y recuperación de contraseña mediante email y contraseña. La sesión SHALL estar disponible en cliente y servidor sin conceder permisos editoriales hasta que la membresía esté activa.

#### Scenario: Registro nuevo
- **WHEN** una persona registra un email nuevo con una contraseña válida y acepta los términos
- **THEN** el sistema crea una identidad pendiente de confirmación y envía el correo correspondiente

#### Scenario: Inicio de sesión activo
- **WHEN** un miembro activo presenta credenciales válidas
- **THEN** el sistema crea una sesión renovable y permite resolver su rol autorizado en servidor

#### Scenario: Identidad sin membresía activa
- **WHEN** una identidad confirmada sin membresía activa inicia sesión
- **THEN** el sistema muestra su estado de solicitud y mantiene bloqueadas las superficies editoriales

#### Scenario: Recuperación de contraseña
- **WHEN** una persona solicita recuperar una cuenta existente y completa el enlace recibido
- **THEN** puede establecer una nueva contraseña sin cambiar su rol ni el estado de su membresía

#### Scenario: Proveedor no incluido
- **WHEN** una persona abre la vista de acceso de producción
- **THEN** Google y GitHub no se presentan como métodos operativos

### Requirement: REQ-002 Solicitud y decisión administrativa

El sistema SHALL aceptar una única solicitud vigente de rol `editor` o `revisor` por identidad confirmada. Solo un `admin` activo SHALL poder aprobarla, asignar cualquiera de esos roles o rechazarla. Cada intento de decisión SHALL quedar auditado sin secretos.

#### Scenario: Crear solicitud
- **WHEN** una identidad confirmada solicita el rol `editor` o `revisor`
- **THEN** el sistema crea una solicitud `pending` idempotente y notifica al admin

#### Scenario: Aprobar solicitud
- **WHEN** un admin activo confirma la aprobación y el rol asignado de una solicitud pendiente
- **THEN** el sistema registra una única decisión `approved` y deja la membresía pendiente de activación

#### Scenario: Rechazar solicitud
- **WHEN** un admin activo confirma el rechazo de una solicitud pendiente
- **THEN** el sistema registra una única decisión `rejected` y la identidad no obtiene acceso editorial

#### Scenario: Enlace administrativo
- **WHEN** un admin autenticado abre un enlace de decisión válido
- **THEN** el sistema muestra la solicitud para confirmación sin mutarla por el mero acceso al enlace

#### Scenario: Decisión repetida o concurrente
- **WHEN** dos operaciones intentan decidir la misma solicitud o se repite una decisión aplicada
- **THEN** solo la primera transición válida cambia el estado y las demás reciben el resultado ya decidido

#### Scenario: Actor no autorizado
- **WHEN** una identidad que no es admin intenta consultar o decidir solicitudes
- **THEN** la aplicación y la base de datos deniegan la operación

### Requirement: REQ-003 Activación mediante código

El sistema SHALL emitir tras la aprobación un código aleatorio de seis dígitos, almacenarlo como digest, caducarlo a los diez minutos, limitarlo a cinco intentos fallidos y permitir un solo consumo. La activación SHALL pertenecer a la identidad aprobada.

#### Scenario: Activación correcta
- **WHEN** el titular autenticado introduce el código válido antes de su expiración
- **THEN** el código se consume y la membresía se activa en una única operación

#### Scenario: Código inválido
- **WHEN** el titular introduce un código incorrecto
- **THEN** el sistema incrementa el contador sin revelar el código y bloquea el challenge al quinto fallo

#### Scenario: Código caducado o consumido
- **WHEN** el titular presenta un código caducado, consumido o bloqueado
- **THEN** el sistema rechaza la activación sin modificar la membresía

#### Scenario: Reenvío de código
- **WHEN** el titular de una solicitud aprobada pide un nuevo código después del intervalo permitido
- **THEN** el sistema invalida el challenge anterior y emite uno nuevo sin repetir la aprobación

#### Scenario: Verificación ajena
- **WHEN** una identidad intenta verificar el challenge de otra
- **THEN** la aplicación y la base de datos deniegan la operación

### Requirement: REQ-004 Correo transaccional fiable

El sistema SHALL enviar confirmaciones y recuperación mediante el proveedor de Auth y SHALL entregar notificaciones administrativas y códigos mediante un adaptador transaccional. Los envíos de aplicación SHALL ser idempotentes, reintentables y observables sin registrar tokens, contraseñas ni códigos completos.

#### Scenario: Entrega única
- **WHEN** el procesador reintenta un evento ya aceptado por el proveedor
- **THEN** la misma clave de idempotencia evita un correo duplicado

#### Scenario: Fallo temporal de entrega
- **WHEN** el proveedor devuelve un fallo recuperable
- **THEN** el sistema conserva la decisión y programa un reintento acotado sin repetir la transición de negocio

#### Scenario: Entrega agotada
- **WHEN** un envío agota los reintentos o deja de ser útil por expiración
- **THEN** el sistema registra el fallo operativo y permite una recuperación explícita compatible con el estado actual

### Requirement: REQ-005 Autorización editorial

El sistema SHALL permitir a `admin`, `editor` y `revisor` activos listar, crear y editar posts. Solo `admin` SHALL gestionar solicitudes. Las rutas protegidas, mutaciones y filas de datos SHALL aplicar la misma matriz de permisos en servidor y base de datos.

#### Scenario: Acceso editorial permitido
- **WHEN** un miembro activo con rol `admin`, `editor` o `revisor` abre el editor
- **THEN** puede listar y editar el catálogo según el contrato editorial

#### Scenario: Acceso editorial denegado
- **WHEN** una persona anónima o una membresía no activa abre el editor o invoca una mutación
- **THEN** no recibe datos editoriales privados ni puede cambiar su estado

#### Scenario: Cambio de idioma durante el acceso
- **WHEN** una persona cambia entre español e inglés en el flujo de autenticación
- **THEN** conserva el destino seguro y el estado no sensible del formulario

### Requirement: REQ-006 Revisiones editoriales persistentes

El sistema SHALL mantener para cada post una versión pública independiente de su revisión privada. El editor SHALL listar posts por estado, crear borradores, guardar borradores incompletos y autoguardar revisiones válidas tras 800 ms, conservando la validación y el preview seguro existentes.

#### Scenario: Crear y seleccionar post
- **WHEN** un miembro editorial crea un borrador o selecciona un post del catálogo
- **THEN** el editor muestra una única pieza activa y mantiene disponible el resto del catálogo

#### Scenario: Guardar borrador incompleto
- **WHEN** un miembro guarda manualmente campos editoriales incompletos
- **THEN** la revisión privada persiste sin publicarse

#### Scenario: Autoguardado válido
- **WHEN** una revisión válida permanece sin cambios durante 800 ms
- **THEN** se guarda y el editor anuncia el resultado accesiblemente

#### Scenario: Editar contenido publicado
- **WHEN** un miembro guarda cambios sobre un post público
- **THEN** la revisión privada conserva los cambios y los lectores siguen viendo la última versión publicada

#### Scenario: Conflicto de escritura
- **WHEN** otra sesión ha guardado una versión posterior
- **THEN** el sistema rechaza la sobrescritura, conserva el texto local y muestra el conflicto

#### Scenario: Error de persistencia
- **WHEN** falla una escritura remota
- **THEN** el editor conserva el contenido local pendiente y no anuncia el guardado como completado

### Requirement: REQ-007 Publicación inmediata y programada

El sistema SHALL validar una revisión antes de publicarla. La publicación inmediata SHALL convertirla en versión pública. La programación SHALL fijar una revisión válida y una fecha UTC futura, promoverla automáticamente al vencer y permitir reprogramar o cancelar antes de la promoción.

#### Scenario: Publicación inmediata
- **WHEN** un miembro publica una revisión válida ahora
- **THEN** esa revisión pasa a ser la versión pública y cualquier programación anterior del post queda cancelada

#### Scenario: Publicación inválida
- **WHEN** un miembro intenta publicar o programar una revisión que no supera la validación editorial
- **THEN** la operación se bloquea y muestra errores accesibles asociados a los campos

#### Scenario: Programación futura
- **WHEN** un miembro programa una revisión válida para una fecha UTC futura
- **THEN** esa revisión queda fijada para publicación y ediciones posteriores permanecen privadas

#### Scenario: Promoción programada
- **WHEN** llega la fecha programada
- **THEN** la revisión fijada se convierte de forma idempotente en la versión pública durante el siguiente ciclo de un minuto

#### Scenario: Reprogramar
- **WHEN** un miembro sustituye una programación pendiente por otra revisión o fecha válida
- **THEN** solo la nueva programación puede promoverse

### Requirement: REQ-008 Lectura pública y contenido inicial

El sistema SHALL ofrecer anónimamente solo versiones publicadas bajo `/{locale}/blog/{slug}` con contenido y metadata coherentes. Una ausencia de versión pública SHALL responder 404. Un fallo de la fuente remota SHALL producir un error recuperable y no un falso 404.

#### Scenario: Post publicado
- **WHEN** una persona solicita el slug de un post con versión pública
- **THEN** recibe el contenido, resumen, portada, categoría, tags, fecha y metadata pública sin autenticarse

#### Scenario: Estado privado
- **WHEN** una persona solicita un slug que solo tiene borrador, revisión o programación pendiente
- **THEN** la ruta responde 404 y no genera contenido indexable

#### Scenario: Fuente no disponible
- **WHEN** la lectura no puede determinar el estado por un fallo de la fuente remota
- **THEN** la ruta devuelve un error recuperable sin afirmar que el post no existe

#### Scenario: Carga inicial repetible
- **WHEN** se inicializa una base vacía o se vuelve a ejecutar la carga de contenido
- **THEN** existen exactamente los tres posts publicados enlazados desde la landing sin duplicar ni sobrescribir cambios posteriores

### Requirement: REQ-009 Entornos y puesta en producción

El sistema SHALL aislar datos y secretos entre local, Preview y Production. La promoción al dominio canónico SHALL requerir migraciones validadas, pruebas completas, verificación del destinatario y remitente, autorización explícita y un procedimiento de recuperación documentado.

#### Scenario: Base local reproducible
- **WHEN** un desarrollador reinicia el entorno local desde cero
- **THEN** las migraciones, políticas, trabajos y datos iniciales producen un estado verificable sin usar credenciales de Production

#### Scenario: Preview aislada
- **WHEN** se despliega una Preview
- **THEN** utiliza datos y variables que no mutan Production y permite validar el flujo completo

#### Scenario: Configuración incompleta
- **WHEN** un entorno desplegado carece de una variable obligatoria
- **THEN** el build o la inicialización falla de forma explícita sin degradarse al modo mock

#### Scenario: Corte autorizado
- **WHEN** las verificaciones son satisfactorias y el usuario autoriza la promoción
- **THEN** la versión validada se publica en `https://www.jmmcdevsign.es` y se ejecutan comprobaciones de humo

#### Scenario: Fallo crítico tras el corte
- **WHEN** una comprobación crítica falla tras promover la aplicación
- **THEN** se ejecuta el procedimiento de recuperación sin borrar datos válidos y se documenta el resultado

### Requirement: REQ-010 Compatibilidad y exclusiones del lanzamiento

El sistema SHALL mantener públicas y simuladas las cinco demos y SHALL conservar las rutas equivalentes en español e inglés. El lanzamiento no SHALL importar datos desde `localStorage`, persistir datos de demos, habilitar OAuth social ni admitir subida de portadas.

#### Scenario: Demos tras el lanzamiento
- **WHEN** una persona anónima abre cualquiera de las cinco demos en español o inglés
- **THEN** la demo conserva su recorrido local sin requerir una cuenta ni escribir en Supabase

#### Scenario: Estado local anterior
- **WHEN** un navegador contiene usuarios, solicitudes o posts mock de una versión anterior
- **THEN** esos datos no se consideran cuentas ni contenido de producción

#### Scenario: Portadas existentes
- **WHEN** un miembro edita un post en el lanzamiento
- **THEN** puede elegir las portadas versionadas existentes sin subir archivos nuevos
