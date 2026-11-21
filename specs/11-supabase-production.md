# SPEC 11 — Migración a Supabase y puesta en producción

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 03, SPEC 3.1, SPEC 04, SPEC 10
> **Date:** 2026-11-21
> **OpenSpec change:** `11-supabase-production`
> **Objective:** Sustituir la membresía y publicación mock por una plataforma persistente y autorizada en Supabase y publicar la web validada en `https://www.jmmcdevsign.es`.

OpenSpec es la fuente de verdad. Los artefactos revisables de este cambio son `proposal.md`, `specs/managed-publishing/spec.md`, `design.md` y `tasks.md` bajo `openspec/changes/11-supabase-production/`.

## Scope

**In:**

- Supabase Auth con email y contraseña, confirmación, sesión SSR, logout y recuperación.
- Solicitudes de `editor` o `revisor`, aprobación o rechazo por un único admin y activación mediante código.
- Resend para SMTP de Auth y correo transaccional de la aplicación.
- RLS, permisos server-side, auditoría y protección de secretos.
- Persistencia de posts, revisiones privadas, selector editorial y control de conflictos.
- Publicación inmediata y programada automáticamente con precisión de un minuto.
- Lectura pública y metadata desde la misma versión publicada.
- Carga inicial de los tres posts de la landing y provisión de `admin@jmmcdevsign.es`.
- Supabase local, Preview aislada y Production.
- Quality gates, verificación independiente, plan de corte, promoción y recuperación.

**Out:**

- Google y GitHub.
- Importación de usuarios, solicitudes o posts desde `localStorage`.
- Persistencia remota de las cinco demos.
- Subida de portadas o gestor multimedia.
- Colaboración editorial realtime e historial navegable de revisiones.
- Cambios visuales ajenos a los estados necesarios del selector, guardado y errores.

## Decisiones cerradas

1. La primera salida migra membresía y posts. Las demos permanecen públicas y simuladas.
2. El lanzamiento usa solo email y contraseña.
3. Production arranca con los tres posts públicos actuales, sin borrador local, y un admin real.
4. El proveedor de correo es Resend.
5. Los posts programados se publican automáticamente.
6. El editor incorpora un selector y sigue editando una pieza a la vez.
7. Editar un post público crea una revisión privada. La versión visible no cambia hasta publicar.
8. La spec termina con la web pública validada en el dominio canónico. La configuración y el corte remoto requieren autorización explícita.

No quedan decisiones bloqueantes. Las referencias de proyectos y credenciales se descubren o introducen durante la configuración autorizada y no cambian el alcance ni el diseño.

## Modelo funcional

### Identidad y membresía

- Una identidad de Auth no equivale a una membresía activa.
- Los roles válidos son `admin`, `editor` y `revisor`.
- Solo se pueden solicitar `editor` y `revisor`.
- Solo `admin` consulta y decide solicitudes.
- `admin`, `editor` y `revisor` activos comparten las capacidades editoriales actuales.
- Los guards de UI mejoran la experiencia. Server-side y RLS son los límites de seguridad.

### Activación

- La aprobación crea un código aleatorio de seis dígitos.
- El código caduca en diez minutos, admite cinco fallos y se consume una vez.
- El titular autenticado solo puede verificar su propio challenge.
- El reenvío espera 60 segundos, invalida el challenge anterior y no repite la aprobación.
- Aprobar o rechazar es idempotente ante doble clic, reintento y concurrencia.

### Correo

- Supabase Auth usa SMTP de Resend para confirmación y recuperación.
- La aplicación usa la API de Resend para avisar al admin y entregar códigos.
- Los envíos tienen claves de idempotencia y reintentos acotados.
- Tokens, contraseñas y códigos completos no aparecen en logs ni auditoría.
- Un fallo de entrega conserva la decisión y permite reenvío seguro.

### Posts y revisiones

- Cada post tiene una identidad estable y punteros separados a revisión de trabajo, versión pública y programación.
- Guardar crea una revisión y usa control optimista para detectar otra sesión más reciente.
- Un conflicto conserva el texto local y exige una resolución explícita.
- La primera publicación o programación fija el slug.
- Publicar ahora cancela una programación anterior.
- Programar fija el snapshot exacto. Cambios posteriores permanecen privados.
- Eliminar retira el post y cancela la programación sin borrar físicamente las revisiones.
- Un cron de un minuto promueve revisiones vencidas de forma idempotente.

### Lectura pública

- Solo la versión publicada puede leerse anónimamente.
- Borradores, revisiones y programaciones sin versión pública producen 404.
- Un fallo remoto produce un estado de error recuperable y nunca un falso 404.
- El contenido, canonical y Open Graph se resuelven desde la misma versión.

## Modelo técnico resumido

- Next.js 16 usa clientes Supabase browser/server y `proxy.ts` para renovar cookies.
- La identidad se verifica en cada operación sensible con claims confiables y membresía de base de datos.
- `memberships` y `registration_requests` aplican RLS. Challenges, auditoría y cola de correo viven en esquema privado.
- Las funciones privilegiadas fijan `search_path`, validan actor y propietario, revocan `EXECUTE` de `PUBLIC` y conceden el mínimo acceso.
- Los posts y revisiones usan RLS. Una vista `security_invoker` expone únicamente versiones públicas.
- Todas las exposiciones a Data API y grants quedan declaradas en migraciones.
- Los secretos viven en los gestores de Supabase o Vercel. Ninguna clave secreta usa prefijo `NEXT_PUBLIC_`.
- Local, Preview y Production usan bases y variables separadas.

## Acceptance criteria

### Autenticación y autorización

- [ ] Una persona puede registrarse, confirmar su email, iniciar y cerrar sesión y recuperar su contraseña.
- [ ] Una identidad confirmada sin membresía activa no puede acceder ni mutar contenido editorial.
- [ ] Solo el admin activo puede consultar y decidir solicitudes.
- [ ] Admin, editor y revisor activos pueden usar el editor.
- [ ] UI, servidor y RLS rechazan la misma matriz de actores no autorizados.
- [ ] Google y GitHub no aparecen como opciones operativas.

### Solicitudes, códigos y correo

- [ ] Crear la misma solicitud dos veces no duplica filas ni avisos.
- [ ] Abrir un enlace administrativo no decide la solicitud sin confirmación.
- [ ] Dos decisiones concurrentes producen una sola transición.
- [ ] El código caduca a los diez minutos, se consume una vez y se bloquea al quinto fallo.
- [ ] El reenvío invalida el código anterior y respeta 60 segundos de espera.
- [ ] Un fallo temporal de Resend se reintenta sin duplicar correo ni decisión.
- [ ] Los logs y la auditoría no contienen secretos, tokens ni códigos completos.

### Editor y publicación

- [ ] El selector permite abrir posts existentes y crear un nuevo borrador.
- [ ] Guardar manualmente conserva borradores incompletos.
- [ ] El autoguardado válido se ejecuta después de 800 ms.
- [ ] Editar un post publicado no altera su versión pública.
- [ ] Dos sesiones no se sobrescriben silenciosamente.
- [ ] Publicar ahora actualiza contenido y metadata y cancela cualquier programación anterior.
- [ ] Programar fija una revisión y la publica durante el siguiente ciclo de un minuto.
- [ ] Reprogramar impide que la programación anterior se publique.
- [ ] Eliminar retira la versión pública y conserva las revisiones para auditoría.

### Lectura, datos iniciales y compatibilidad

- [ ] Los tres slugs actuales de la landing existen tras una inicialización limpia.
- [ ] Repetir la carga no duplica posts ni sobrescribe ediciones.
- [ ] Un post publicado se lee anónimamente en español e inglés con metadata coherente.
- [ ] Un slug sin versión pública devuelve 404.
- [ ] Una caída de Supabase produce error recuperable.
- [ ] Las cinco demos siguen siendo públicas, bilingües, locales y sin escrituras remotas.
- [ ] Los snapshots mock antiguos no conceden identidad ni publican contenido.

### Operación y lanzamiento

- [ ] `supabase db reset` reconstruye esquema, policies, cron y seed desde cero.
- [ ] `supabase test db` demuestra permisos, propiedad, estados e idempotencia.
- [ ] Preview usa datos y variables aislados de Production.
- [ ] Un entorno desplegado sin configuración obligatoria falla explícitamente.
- [ ] Lint, typecheck, unitarios, build y E2E pasan con comandos reales del proyecto.
- [ ] `openspec-verify-change` pasa y `spec-verifier` dicta `APPROVED`.
- [ ] El usuario autoriza el plan de corte antes de tocar Production.
- [ ] El candidato pasa humo antes de recibir el dominio.
- [ ] `https://www.jmmcdevsign.es` pasa humo tras la promoción y existe un procedimiento de recuperación comprobable.

## Test strategy

| ID | Nivel | Cobertura principal |
|---|---|---|
| TEST-001–003 | Configuración y pgTAP | Esquema, grants, RLS, funciones y reproducción local |
| TEST-004–006 | Unitario, componente y E2E | Sesión, registro, recuperación, roles y guards |
| TEST-007–010 | pgTAP, integración y E2E | Decisiones, concurrencia, códigos, correo y activación |
| TEST-011–014 | Integración, componente y E2E | Repositorio, revisiones, conflictos, selector y borrado |
| TEST-015–018 | pgTAP, integración y E2E | Publicación, cron, lectura, metadata y seed |
| TEST-019–021 | Regresión y seguridad | Runtime remoto, demos, secretos, advisors y logs |
| TEST-022–024 | Preview real | Entornos, admin y recorrido completo |
| TEST-025–028 | Gates y producción | Suite completa, corte, candidato y dominio público |

Comandos obligatorios previstos:

```bash
supabase db reset
supabase test db
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
openspec validate 11-supabase-production --strict
```

## Traceability

| Requirement | Tasks | Tests | Cierre esperado |
|---|---|---|---|
| REQ-001 | TASK-002, TASK-006–008, TASK-030–031 | TEST-001, TEST-004–006, TEST-027–028 | VERIFY-PASS |
| REQ-002 | TASK-003–004, TASK-008–009, TASK-012, TASK-025 | TEST-002–003, TEST-006–007, TEST-010, TEST-023 | VERIFY-PASS |
| REQ-003 | TASK-003–004, TASK-010, TASK-012 | TEST-002–003, TEST-008, TEST-010 | VERIFY-PASS |
| REQ-004 | TASK-002, TASK-011–012, TASK-023–024, TASK-030 | TEST-001, TEST-009–010, TEST-021–022, TEST-027 | VERIFY-PASS |
| REQ-005 | TASK-004, TASK-007–008, TASK-013, TASK-023 | TEST-003, TEST-005–006, TEST-011, TEST-021 | VERIFY-PASS |
| REQ-006 | TASK-003, TASK-013–016 | TEST-002, TEST-011–014 | VERIFY-PASS |
| REQ-007 | TASK-016–018 | TEST-014–016 | VERIFY-PASS |
| REQ-008 | TASK-003–004, TASK-019–020, TASK-030 | TEST-002–003, TEST-017–018, TEST-027 | VERIFY-PASS |
| REQ-009 | TASK-001–002, TASK-021, TASK-023–031 | TEST-001, TEST-019, TEST-021–028 | VERIFY-PASS |
| REQ-010 | TASK-021–022, TASK-026, TASK-031 | TEST-019–020, TEST-024, TEST-028 | VERIFY-PASS |

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Aprobación aplicada con correo fallido | Challenge recuperable, cola idempotente y reenvío sin repetir decisión |
| Acceso indebido por una policy incompleta | Grants explícitos, RLS, tests por rol y verificación independiente |
| Sobrescritura editorial concurrente | Versionado optimista y conservación del texto local |
| Publicación programada tardía | SLA explícito de 60 segundos y monitorización del cron |
| Preview muta Production | Proyectos y variables separados, comprobados antes del despliegue |
| Rollback de app incompatible con la base | Migraciones compatibles hacia delante y corrección de datos autorizada |
| Secretos en cliente o logs | Gestores de secretos, revisión de prefijos y tests de saneado |
| Cambios locales previos mezclados | Inventario inicial, preservación del árbol y commits por fase |

## Review record

- **Grill-me completed:** Sí.
- **Blocking decisions:** Ninguna.
- **Specification approval:** Confirmada por el usuario antes de iniciar la implementación.
- **Build Mode authorization:** Confirmada por el usuario para trabajar en la rama de la spec con escritura habilitada.
- **Production authorization:** Se solicitará con el plan de corte y destinos identificados.
- **Archive authorization:** Se solicitará después de Verify y `spec-verifier APPROVED`.
