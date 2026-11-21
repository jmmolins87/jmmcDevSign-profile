# Design

## Context

La motivación está en `proposal.md`. El proyecto usa Next.js 16 App Router, React 19 y `@supabase/supabase-js` 2.118.0. Ya existen contratos para autenticación, correo y repositorios de posts, pero sus adaptadores son locales. El árbol de trabajo contiene cambios previos de navegación que la implementación debe preservar.

Supabase cambió en 2026 la exposición automática de tablas a Data API. El diseño declara concesiones explícitas, habilita RLS y evita depender de defaults del proyecto. Next.js 16 usa `proxy.ts`; el proxy renueva cookies, mientras cada operación sensible verifica identidad y autorización por sí misma.

## Goals / Non-Goals

**Goals:**

- Una fuente de verdad compartida para identidad, membresía y contenido editorial.
- Autorización consistente en UI, servidor y PostgreSQL.
- Transiciones idempotentes y auditables ante reintentos y concurrencia.
- Entornos reproducibles y un corte de producción reversible para la aplicación.
- Conservar los contratos, validación, rutas y dirección visual existentes siempre que sea posible.

**Non-Goals:**

- Sincronizar o importar snapshots de navegador.
- Persistir las demos, añadir colaboración en tiempo real o historial navegable de revisiones.
- Habilitar OAuth social, subida de archivos o un gestor multimedia.
- Crear un panel de observabilidad nuevo. Se usarán los registros de Supabase, Resend y Vercel junto con auditoría estructurada.

## Decisions

### 1. Separación por entorno

Se usará Supabase local para desarrollo y pruebas, un proyecto remoto aislado para Preview y otro para Production. Vercel tendrá variables distintas por entorno. Ninguna Preview apuntará a Production.

Variables públicas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Secretos fuera del repositorio:

- `SUPABASE_SECRET_KEY`, solo en funciones privilegiadas y operaciones administrativas que lo necesiten
- `RESEND_API_KEY`
- `ACTIVATION_CODE_ENCRYPTION_KEY`
- `ADMIN_NOTIFICATION_EMAIL=admin@jmmcdevsign.es`

Se migrará desde `NEXT_PUBLIC_SUPABASE_ANON_KEY` a la clave publicable actual. No habrá fallback mock en un entorno desplegado. La alternativa de compartir un solo proyecto entre Preview y Production se descarta porque permitiría que una prueba alterase usuarios o contenido público.

### 2. Sesión SSR y comprobación de identidad

Se añadirá `@supabase/ssr` fijando su versión y dos factorías de cliente, browser y server. `proxy.ts` renovará cookies mediante `getClaims()`. Los Server Components, Server Actions, Route Handlers y funciones privilegiadas comprobarán sus propios claims y consultarán la membresía activa antes de servir datos privados o mutar.

Los redirects son experiencia de usuario. La autorización real vive en cada operación y en RLS. No se usará `user_metadata` para autorizar. La membresía y el rol viven en tablas controladas por el servidor. El rol solicitado puede viajar como dato no confiable y se valida de nuevo contra `editor | revisor`.

### 3. Modelo de membresía

Tablas principales:

- `public.memberships`: `user_id`, `role`, `status`, timestamps y actor de activación. Solo admite `admin | editor | revisor` y `pending | active | rejected`.
- `public.registration_requests`: identidad, rol solicitado, rol asignado, estado, timestamps de decisión y versión para concurrencia.
- `private.verification_challenges`: digest, expiración, intentos, consumo y referencia a solicitud.
- `private.audit_events`: actor, acción, entidad, resultado, timestamp y metadatos minimizados.
- `private.email_deliveries`: evento, destinatario, plantilla, clave de idempotencia, payload cifrado, intentos, estado y último error saneado.

Una identidad confirmada crea su solicitud mediante una función transaccional. Habrá como máximo una solicitud vigente por usuario. Los endpoints de aprobación y rechazo llaman a funciones PostgreSQL atómicas que bloquean la fila y devuelven `applied` o `already-decided`.

Las operaciones atómicas que necesitan tablas privadas usarán funciones `SECURITY DEFINER` en un esquema no expuesto. Cada función fijará `search_path`, comprobará `auth.uid()`, consultará el rol del actor, validará el propietario cuando corresponda y tendrá `EXECUTE` revocado a `PUBLIC`, concediéndolo solo al rol necesario.

### 4. Código y entrega transaccional

Al aprobar, una función privilegiada genera el código con aleatoriedad criptográfica, guarda su digest y crea un evento de entrega con el código cifrado mediante AES-GCM. La clave vive en secretos de la función y no en PostgreSQL ni en el cliente. Un procesador server-side descifra únicamente el evento que va a enviar, llama a Resend con una clave de idempotencia estable y elimina el payload cifrado después de una entrega aceptada o de su caducidad.

La verificación compara el digest dentro de una transacción y aplica consumo más activación juntos. El reenvío respeta una espera de 60 segundos, invalida challenges anteriores y genera uno nuevo. Se permiten cinco intentos y una validez de diez minutos.

Los reintentos de entrega usarán backoff acotado mientras el challenge siga vigente. Un fallo de email no revierte una decisión administrativa. El titular puede solicitar reenvío. Esta separación evita duplicar decisiones y permite recuperar una entrega fallida.

Resend se usará de dos formas. SMTP será el transporte de Supabase Auth para confirmación y recuperación. La API HTTP enviará avisos al admin y códigos de activación. El dominio remitente debe estar verificado antes de Preview compartida y Production.

### 5. Modelo editorial por revisiones

Tablas principales:

- `public.posts`: identidad estable, slug, creador, `working_revision_id`, `published_revision_id`, `scheduled_revision_id`, `scheduled_at`, versión de concurrencia y `deleted_at`.
- `public.post_revisions`: snapshot del contrato `PostDraft` sin punteros de publicación, autor, número de revisión y timestamp.
- `public.cover_assets`: catálogo de las portadas versionadas existentes y su texto alternativo.
- `public.published_posts`: vista `security_invoker` que expone solo la revisión apuntada por `published_revision_id` de posts no eliminados.

Guardar crea una nueva revisión y cambia `working_revision_id` únicamente si la versión esperada de `posts` coincide. Esto evita pérdida silenciosa entre pestañas. La UI conserva el borrador local cuando recibe un conflicto y ofrece recargar la versión remota o copiar el texto antes de reintentar.

Publicar cambia `published_revision_id` al snapshot validado y cancela cualquier programación. Programar fija una revisión existente en `scheduled_revision_id` y una fecha UTC. Ediciones posteriores crean otra revisión y no alteran la programada. Reprogramar sustituye ambos campos. La primera publicación o programación fija el slug. Cambiarlo después queda fuera de alcance para preservar URLs.

Eliminar aplica `deleted_at`, retira la versión pública y cancela la programación en una operación atómica. Los datos se conservan para auditoría y recuperación operativa. No se borrarán físicamente desde la UI.

### 6. Publicación programada y lectura

Supabase Cron ejecutará cada minuto una función SQL que bloquea en lotes los posts vencidos y promueve cada `scheduled_revision_id` de forma idempotente. La migración crea tanto la función como el job. Las pruebas invocarán directamente la función con reloj y fixtures controlados.

La ruta pública y `generateMetadata` consultarán el mismo adaptador server-side sobre `published_posts`. Un resultado existente produce contenido y metadata. Ausencia confirmada produce `notFound()`. Errores de red o consulta se propagan al límite de error y no se convierten en 404.

No se mantendrá una caché de contenido indefinida entre solicitudes durante esta fase. La coherencia inmediata prima sobre reducir lecturas. Se podrá añadir revalidación por tags después de medir tráfico real.

### 7. RLS, concesiones y exposición

Todas las tablas de esquemas expuestos tendrán RLS. Los grants de Data API se declararán en migraciones. `anon` solo podrá leer la vista pública y las filas necesarias para resolver versiones publicadas. `authenticated` accederá a sus solicitudes y membresía. Los miembros activos tendrán políticas editoriales. Solo admins activos leerán y decidirán solicitudes ajenas.

Las tablas privadas no se expondrán a Data API. Las vistas usarán `security_invoker = true`. Las políticas de update tendrán `USING` y `WITH CHECK`. Las pruebas de base de datos demostrarán aislamiento por rol, propiedad y estado.

### 8. Datos iniciales y admin

Una carga idempotente insertará por identificador y slug los tres posts publicados actuales y sus portadas. Solo insertará cuando no exista el registro, por lo que una repetición no sobrescribirá contenido editado.

La cuenta `admin@jmmcdevsign.es` se provisionará como operación controlada después de aplicar migraciones. Primero se crea o invita la identidad y se confirma el email. Después se inserta su membresía `admin/active` mediante un procedimiento de una sola ejecución que resuelve el UUID por email y falla si encuentra cero o varias identidades. No se versionarán contraseña, UUID ni token.

### 9. Adaptadores y experiencia

Los contratos `AuthAdapter`, `EmailService`, `PostRepository` y `PublicPostRepository` se conservarán donde representen el dominio. Los adaptadores Supabase reemplazarán a los mocks en producción. Los mocks podrán seguir en pruebas unitarias aisladas, sin selección dinámica en runtime desplegado.

El editor añadirá un selector con estado, título y última modificación, más la acción de nuevo post. Continuará editando una sola pieza a la vez. Los mensajes diferenciarán guardando, guardado, conflicto, sin conexión, programado y publicado. La navegación por teclado, foco, `aria-live`, 375 px, 1440 px y reduced motion siguen siendo criterios obligatorios.

### 10. Validación y observabilidad

Las transiciones emitirán auditoría estructurada con identificadores, actor, resultado y timestamp. Los errores no incluirán secretos, códigos ni contenido completo del post. La verificación abarcará tests SQL de políticas y funciones, unitarios de dominio y adaptadores, componentes, E2E local y humo en Preview y Production.

El estado mínimo observable incluye fallos de login, decisiones, activaciones, cola de correo, ejecuciones del cron, errores de lectura pública y despliegues. Antes del corte se probarán alertas o consultas guardadas para detectar entregas fallidas, cron atrasado y errores 5xx.

## Risks / Trade-offs

- [La aprobación queda aplicada aunque falle el correo] → Mantener challenge recuperable, entrega reintentable y reenvío explícito sin repetir la decisión.
- [Un secreto privilegiado amplía el impacto de una función comprometida] → Limitarlo a runtime server-side, validar JWT y rol antes de usarlo, restringir funciones y rotar la clave tras una sospecha.
- [Las revisiones incrementan almacenamiento] → Conservarlas durante el lanzamiento y evaluar una política de retención con métricas reales.
- [El cron puede publicar hasta un minuto tarde] → Mostrar la fecha programada en UTC y aceptar un SLA de 60 segundos definido por la spec.
- [Un rollback de frontend no revierte el esquema] → Diseñar migraciones compatibles hacia delante y aplicar correcciones de datos separadas y autorizadas.
- [Los cambios locales previos pueden mezclarse] → Inventariarlos antes de crear la rama, preservarlos y limitar cada commit a archivos de la fase correspondiente.

## Migration Plan

1. Crear la rama de la spec conservando el árbol de trabajo y persistir los artefactos aprobados.
2. Inicializar la configuración local de Supabase dentro del repositorio, crear migraciones, seeds, pruebas SQL y tipos generados.
3. Implementar sesión SSR, modelo de membresía, funciones atómicas, correo y tests antes de conectar la UI.
4. Implementar revisiones, publicación, cron y adaptadores. Migrar después las superficies de autenticación, aprobación, editor y lectura.
5. Ejecutar `supabase db reset`, pruebas SQL, lint, typecheck, unitarios, build y E2E.
6. Aplicar migraciones en Preview, configurar Resend y Vercel Preview, provisionar un admin de Preview y ejecutar el recorrido completo.
7. Presentar el plan de Production con proyecto, dominio, migraciones, variables, backup disponible, comprobaciones y rollback. Esperar autorización explícita.
8. Aplicar migraciones en Production, cargar los tres posts, provisionar el admin y desplegar un candidato con variables de Production sin asignar todavía el dominio.
9. Ejecutar humo contra el candidato. Promoverlo al dominio, repetir humo y vigilar errores y entregas.
10. Ante un fallo crítico de aplicación, restaurar el destino anterior del dominio. Ante un fallo de datos, detener mutaciones y aplicar una corrección hacia delante. Una restauración de base de datos requiere autorización específica y análisis de escrituras posteriores.

## Open Questions

No quedan preguntas de producto o arquitectura que bloqueen la implementación. Las referencias concretas de los proyectos remotos, los identificadores de despliegue y las credenciales se descubrirán o introducirán durante la fase autorizada de configuración sin cambiar este diseño.
