# Tasks

## 1. Base reproducible y contratos

- [ ] 1.1 `TASK-001` Inventariar y preservar los cambios locales previos, crear la rama de la spec e inicializar Supabase local dentro del repositorio; verificar `git status --short`, `git branch --show-current`, `supabase --version` y `supabase status`.
- [ ] 1.2 `TASK-002` Añadir y fijar las dependencias SSR y de correo necesarias, actualizar las variables documentadas sin valores secretos y verificar `pnpm install`, `pnpm typecheck` y el test de configuración de Supabase. Cubre `REQ-001`, `REQ-004` y `REQ-009` mediante `TEST-001`.
- [ ] 1.3 `TASK-003` Crear migraciones para esquemas, enums, membresías, solicitudes, challenges, auditoría, entregas, posts, revisiones, portadas, índices, constraints y timestamps; verificar `supabase db reset` desde una base vacía. Cubre `REQ-002`, `REQ-003`, `REQ-006` y `REQ-008` mediante `TEST-002`.
- [ ] 1.4 `TASK-004` Declarar grants, RLS, vista pública `security_invoker` y funciones privilegiadas con permisos mínimos; añadir pgTAP para anonimato, propiedad, estados y roles y verificar `supabase test db`. Cubre `REQ-002`, `REQ-003`, `REQ-005` y `REQ-008` mediante `TEST-003`.
- [ ] 1.5 `TASK-005` Generar tipos TypeScript desde la base local, sustituir los tipos provisionales y documentar el comando reproducible; verificar que una regeneración no produce diff y que `pnpm typecheck` pasa.

## 2. Identidad, sesión y membresía

- [ ] 2.1 `TASK-006` Implementar clientes Supabase de browser y servidor, `proxy.ts`, callback de confirmación y resolución server-side de identidad; añadir tests de cookies, claims y errores y verificar `pnpm test -- supabase`. Cubre `REQ-001` mediante `TEST-004`.
- [ ] 2.2 `TASK-007` Implementar registro por email, confirmación, login, logout y recuperación de contraseña en español e inglés, retirando Google y GitHub como opciones operativas; añadir tests de componentes y verificar el flujo con teclado a 375 px y 1440 px. Cubre `REQ-001` y `REQ-005` mediante `TEST-005`.
- [ ] 2.3 `TASK-008` Implementar creación idempotente de solicitudes, consulta del estado y guards server-side para anónimo, pendiente, rechazado y activo; verificar tests unitarios, integración local y matriz de acceso E2E. Cubre `REQ-001`, `REQ-002` y `REQ-005` mediante `TEST-006`.

## 3. Aprobación, activación y correo

- [ ] 3.1 `TASK-009` Implementar las transiciones atómicas de aprobación y rechazo, enlaces que solo precargan la decisión y auditoría saneada; verificar pgTAP con decisiones repetidas, concurrentes, caducadas y actores no autorizados. Cubre `REQ-002` mediante `TEST-007`.
- [ ] 3.2 `TASK-010` Implementar generación, digest, cifrado temporal, expiración, cinco intentos, consumo único y reenvío con espera de 60 segundos; verificar pgTAP y tests de integración con reloj controlado. Cubre `REQ-003` mediante `TEST-008`.
- [ ] 3.3 `TASK-011` Implementar el adaptador Resend, plantillas HTML y texto, claves de idempotencia, cola, reintentos y saneado de errores; verificar contra un doble de protocolo que no duplica envíos ni expone códigos o tokens. Cubre `REQ-004` mediante `TEST-009`.
- [ ] 3.4 `TASK-012` Conectar `/[locale]/admin/approval` y la activación del solicitante a los servicios reales, con estados de carga, error, decisión repetida y entrega fallida; verificar componentes accesibles y E2E de solicitud, aprobación, código, activación y rechazo. Cubre `REQ-002`, `REQ-003` y `REQ-004` mediante `TEST-010`.

## 4. Repositorio editorial y revisiones

- [ ] 4.1 `TASK-013` Implementar repositorios Supabase para catálogo, creación, guardado y eliminación lógica preservando los contratos de dominio; añadir tests de integración contra Supabase local y verificar CRUD autorizado y aislamiento. Cubre `REQ-005` y `REQ-006` mediante `TEST-011`.
- [ ] 4.2 `TASK-014` Implementar revisiones y control optimista de concurrencia, conservando el contenido local ante fallo o conflicto; añadir tests con dos sesiones y verificar que una revisión privada no cambia la lectura pública. Cubre `REQ-006` mediante `TEST-012`.
- [ ] 4.3 `TASK-015` Añadir al editor el selector de posts, nuevo borrador y estados accesibles de guardado, conflicto y desconexión; verificar Testing Library y Playwright a 375 px y 1440 px, teclado, foco, `aria-live` y reduced motion. Cubre `REQ-006` mediante `TEST-013`.
- [ ] 4.4 `TASK-016` Sustituir la eliminación física por retirada lógica confirmada y cancelar la programación asociada; verificar integración y E2E sin pérdida física de revisiones. Cubre `REQ-006` y `REQ-007` mediante `TEST-014`.

## 5. Publicación y lectura pública

- [ ] 5.1 `TASK-017` Implementar publicación inmediata, fijación de slug, programación, reprogramación y cancelación mediante operaciones atómicas; verificar integración para validación, versión pública anterior y programación sustituida. Cubre `REQ-007` mediante `TEST-015`.
- [ ] 5.2 `TASK-018` Crear la función idempotente de promoción y el job de Supabase Cron de un minuto; verificar pgTAP con límites UTC, lotes, reejecución y ediciones posteriores a la programación. Cubre `REQ-007` mediante `TEST-016`.
- [ ] 5.3 `TASK-019` Migrar la ruta pública y metadata al adaptador remoto, diferenciando ausencia de fallo; verificar posts públicos, estados privados, 404, error recuperable, canonical y Open Graph en ambos idiomas. Cubre `REQ-008` mediante `TEST-017`.
- [ ] 5.4 `TASK-020` Crear la carga inicial idempotente de las tres publicaciones y portadas, ejecutar dos veces sobre una base local modificada y verificar ausencia de duplicados y de sobrescritura. Cubre `REQ-008` mediante `TEST-018`.

## 6. Compatibilidad y endurecimiento

- [ ] 6.1 `TASK-021` Retirar la selección de adaptadores mock del runtime desplegado y tratar snapshots locales antiguos como datos de demo sin autoridad; verificar que faltas de configuración remota fallan explícitamente. Cubre `REQ-009` y `REQ-010` mediante `TEST-019`.
- [ ] 6.2 `TASK-022` Ejecutar regresión de las cinco demos y navegación bilingüe, confirmando que permanecen públicas, locales y sin escrituras Supabase; verificar `pnpm test`, los E2E de demos y una inspección de red. Cubre `REQ-010` mediante `TEST-020`.
- [ ] 6.3 `TASK-023` Revisar secretos, grants, políticas, funciones privilegiadas, dependencias, logs y errores, ejecutar los advisors disponibles y corregir hallazgos críticos o altos; documentar evidencias y riesgos residuales. Cubre `REQ-004`, `REQ-005` y `REQ-009` mediante `TEST-021`.

## 7. Preview aislada

- [ ] 7.1 `TASK-024` Crear o seleccionar con autorización el proyecto Supabase de Preview, aplicar migraciones y seed, configurar SMTP/API de Resend y variables Preview de Vercel sin exponer valores; verificar referencias, destinatarios, remitente y aislamiento antes de aplicar. Cubre `REQ-009` mediante `TEST-022`.
- [ ] 7.2 `TASK-025` Provisionar un admin de Preview mediante el procedimiento documentado y verificar que falla con cero o varias identidades y que no persiste contraseñas ni tokens. Cubre `REQ-002` y `REQ-009` mediante `TEST-023`.
- [ ] 7.3 `TASK-026` Desplegar Preview y ejecutar el recorrido real completo de registro a lectura pública, publicación programada y regresión de demos; conservar capturas revisadas solo durante la prueba, eliminar temporales y detener el servidor local. Verificar ausencia de errores críticos en logs. Cubre `REQ-001` a `REQ-010` mediante `TEST-024`.

## 8. Quality gates, verificación y Production

- [ ] 8.1 `TASK-027` Ejecutar desde limpio `supabase db reset`, `supabase test db`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e`; registrar salidas reales y corregir cualquier fallo obligatorio. Cubre `REQ-001` a `REQ-010` mediante `TEST-025`.
- [ ] 8.2 `TASK-028` Ejecutar `openspec-verify-change` y la auditoría independiente de `spec-verifier`, corregir hallazgos y repetir hasta `APPROVED` o hasta tres rondas; verificar la matriz `REQ → TASK → TEST → VERIFY-PASS`.
- [ ] 8.3 `TASK-029` Preparar el plan de corte con proyectos y propietario confirmados, diff de migraciones, backup disponible, variables, dominio, humo, observación y recuperación; presentar el plan y obtener autorización explícita antes de cualquier cambio remoto en Production. Cubre `REQ-009` mediante `TEST-026`.
- [ ] 8.4 `TASK-030` Tras la autorización, aplicar migraciones y seed a Production, configurar Resend y Vercel, provisionar `admin@jmmcdevsign.es` y desplegar el candidato sin asignar el dominio; verificar identidad de cada destino y ejecutar humo contra el candidato. Cubre `REQ-001`, `REQ-004`, `REQ-008` y `REQ-009` mediante `TEST-027`.
- [ ] 8.5 `TASK-031` Tras humo satisfactorio, promover el candidato a `https://www.jmmcdevsign.es`, verificar HTTPS, redirect raíz, login, permisos, tres posts, metadata y cinco demos en español e inglés, y observar errores y entregas; ejecutar la recuperación documentada ante cualquier fallo crítico. Cubre `REQ-001` a `REQ-010` mediante `TEST-028`.

## Workflow follow-up

- Solicitar autorización final del usuario para archivar cuando todas las tareas estén completas, Verify haya pasado y `spec-verifier` dicte `APPROVED`.
- Sincronizar la capability `managed-publishing` y archivar el cambio siguiendo el ciclo OpenSpec.
