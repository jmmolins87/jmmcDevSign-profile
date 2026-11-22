# Supabase, correo y publicación

## Desarrollo local

Con Docker en ejecución, arranca el proyecto local y reconstruye la base de pruebas.

```bash
supabase start
supabase db reset --local
supabase test db --local
```

Copia `.env.example` a `.env.local` y usa las claves publishable y secret de **ese stack local** que muestra `supabase status`. Configura `ACTIVATION_CODE_ENCRYPTION_KEY` con 32 bytes hexadecimales y `MEMBERSHIP_MAIL_CRON_SECRET` con un valor aleatorio de al menos 32 caracteres. Mantén la URL pública de la aplicación en `http://127.0.0.1:3000`. Mailpit captura las confirmaciones, recuperaciones y correos de membresía en `http://127.0.0.1:54324`. La API de Resend se usa en entornos desplegados.

`pnpm test:e2e` toma las credenciales del stack local e inicia su propio proceso Next.js en el puerto 3099. Necesita los navegadores que declara Playwright. El comando provisiona identidades de prueba en local y el runner detiene el servidor al terminar.

Regenera los tipos después de reconstruir la base y revisa el diff.

```bash
generated_types=$(mktemp)
supabase gen types --local --schema public --lang typescript > "$generated_types" &&
  sed 's/[[:blank:]]*$//' "$generated_types" > app/lib/supabase/database.types.ts
rm "$generated_types"
```

## Preview y Production

Usa un proyecto Supabase distinto por entorno. Preview usa `jmmcDevSign-preview` (`khwtrecxjhtimaigcjav`) en Frankfurt y el origen `https://jmmcdevsign-preview.vercel.app`. Configura estos valores en el alcance correspondiente de Vercel.

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Origen HTTPS del proyecto de ese entorno |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de ese proyecto |
| `NEXT_PUBLIC_SITE_URL` | Origen HTTPS estable del entorno |
| `SUPABASE_SECRET_KEY` | Clave secreta del proyecto, solo servidor |
| `ACTIVATION_CODE_ENCRYPTION_KEY` | 32 bytes hexadecimales, distintos por entorno |
| `ADMIN_NOTIFICATION_EMAIL` | Buzón de pruebas en Preview y `admin@jmmcdevsign.es` en Production |
| `MEMBERSHIP_MAIL_FROM` | `JMMC <hola@jmmcdevsign.es>` una vez verificado `jmmcdevsign.es` en Resend |
| `RESEND_API_KEY` | Clave de envío limitada al dominio, solo servidor |
| `MEMBERSHIP_MAIL_CRON_SECRET` | Credencial aleatoria para el worker, distinta por entorno |

Resend verificó el envío desde `jmmcdevsign.es` en Irlanda (`eu-west-1`). Los servidores autoritativos de STRATO publican el TXT de DKIM `resend._domainkey` que generó Resend y los CNAME `rresend-bounces` a `rsend-euw1.forge.rmta.net` y `resend-bounces` a `send.forge.rmta.net`. El MX de `jmmcdevsign.es` sigue apuntando al servicio de buzones de STRATO. [Gestión de DNS en STRATO](https://www.strato.es/faq/dominios/que-registros-DNS-ofrece-STRATO-y-como-puedo-gestionarlos/).

Crea claves con permiso `Sending access` limitado al dominio y usa claves distintas para Preview y Production. Guarda la clave de la API como `RESEND_API_KEY` en el alcance correspondiente de Vercel y el remitente como `MEMBERSHIP_MAIL_FROM`.

Configura Auth con email y contraseña, confirmación obligatoria y el SMTP de Resend. Usa `smtp.resend.com`, puerto `465`, usuario `resend`, una clave de envío como contraseña, `JMMC` como nombre y `hola@jmmcdevsign.es` como dirección del remitente. Copia las plantillas de `supabase/templates/` en Supabase Auth y verifica que las dos URLs exactas `/es/auth/confirm` y `/en/auth/confirm` están autorizadas bajo el origen del entorno. Comprueba remitente, destinatario y enlaces con una cuenta de prueba. Gestiona claves y contraseñas en los paneles o el gestor de secretos. [Guía de Resend para Supabase](https://resend.com/docs/send-with-supabase-smtp).

Configura en Vault `membership_mail_worker_url` con la URL HTTPS estable del entorno que atiende `/api/internal/membership-mail`. Configura `membership_mail_worker_secret` con el mismo valor de `MEMBERSHIP_MAIL_CRON_SECRET` que usa el worker. El cron reclama lotes pendientes a través del endpoint autenticado. Usa estados de entrega y logs con códigos saneados para identificar los fallos.

El alias de Preview tiene una excepción de protección de Vercel para que Cron alcance el worker. La excepción se aplica a `jmmcdevsign-preview.vercel.app`. El endpoint sigue exigiendo `MEMBERSHIP_MAIL_CRON_SECRET`, y Auth y RLS controlan el acceso editorial. [Excepciones de protección de Vercel](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/deployment-protection-exceptions).

Los enlaces administrativos firmados caducan a las 24 horas desde que se creó la solicitud, el mismo plazo que la entrega del aviso. Precargan una confirmación para el admin autenticado. La solicitud sigue disponible en el panel para una revisión explícita.

El seed carga tres publicaciones iniciales. Repetirlo conserva las ediciones. Para provisionar el admin, crea o invita la identidad en Auth y comprueba que el correo está confirmado. En una sesión SQL administrativa autorizada ejecuta, con el correo del entorno como parámetro:

```sql
select private.provision_admin('<correo confirmado del entorno>');
```

El procedimiento falla si falta la identidad confirmada, si el email es ambiguo o si ya existe otro admin. Repetirlo para el mismo admin activo conserva su membresía. Comprueba el resultado iniciando sesión y abriendo el panel administrativo.

## Corte y recuperación

### Destinos comprobados

Production reutiliza el proyecto Vercel `jmmc-porfolio` (`prj_cnxoaW2Ls4gTlxSgmNhKTdOgbXkD`) del equipo `juanmas-projects-0ed060b8`, que ya tiene asignados `www.jmmcdevsign.es` y `jmmcdevsign.es`. El despliegue Astro actual es `dpl_EFcyQ7EqpHKXD1RA5r1iJHoc2PbL`, desde `jmmolins87/jmmc-porfolio` en `master`. El candidato Next.js se construye desde `jmmolins87/jmmcDevSign-profile`. Conserva el despliegue Astro para recuperar el servicio mediante [Instant Rollback de Vercel](https://vercel.com/docs/deployments/promoting-a-deployment#instant-rollback).

La comprobación HTTPS del destino actual devolvió 308 en el dominio raíz y 302 desde `www.jmmcdevsign.es/` a `/es/`. El candidato se comprobará con sus propios redirects antes de promoverlo.

El proyecto Supabase de Production confirmado es `wktsthvgugrvthyuruqh`. La inspección de solo lectura mostró PostgreSQL 17.11, sin migraciones registradas ni tablas de aplicación en `public` o `private`, y sin usuarios en Auth. `supabase_vault` está instalada. Las migraciones declaran la instalación de `pg_cron` y `pg_net`, disponibles en el servidor. Production está en el plan Free. Genera, cifra y verifica un respaldo lógico de esquema y datos antes de aplicar las migraciones. Registra su huella, hora y ubicación de custodia en el registro del corte. [Copias de seguridad de Supabase](https://supabase.com/docs/guides/platform/backups).

### Secuencia de lanzamiento

1. Registra los identificadores de los proyectos Supabase y Vercel, propietario, dominios, destino actual del dominio y candidato. Verifica que Preview apunta a su proyecto aislado. Conserva el identificador del despliegue que recibe tráfico y comprueba el backup y la retención de Production.
2. Valida el diff de migraciones y seed tras un reset local. Completa el recorrido en Preview y registra resultados de correo, permisos, publicación programada, rutas públicas y demos bilingües.
3. Presenta los destinos, el diff, el punto de recuperación y el resultado de Preview. Tras la autorización del corte, aplica migraciones y seed y configura Auth, correo y variables de Production. Provisiona el admin. El `vercel.json` del repositorio selecciona Next.js para este build. Despliega el candidato en el mismo proyecto con `vercel deploy --prod --skip-domain` y comprueba el preset que usó Vercel.
4. Verifica en la URL del candidato el login con una identidad ya confirmada, el rechazo de permisos, los tres slugs y su metadata, las cinco demos y la publicación programada. Tras el humo satisfactorio, ejecuta `vercel promote <candidato>` y repite las comprobaciones en `https://www.jmmcdevsign.es`, incluido HTTPS y el redirect del dominio raíz. Comprueba en el canónico la confirmación y la recuperación por correo. Los enlaces de ambos flujos se construyen con `NEXT_PUBLIC_SITE_URL` de Production.
5. Observa los 5xx de Vercel, las entregas fallidas, la cola vencida y las ejecuciones de cron. Ante un fallo crítico de aplicación, ejecuta `vercel rollback dpl_EFcyQ7EqpHKXD1RA5r1iJHoc2PbL` y repite el humo. Ante un fallo de datos, detén las mutaciones y prepara una migración correctiva hacia delante. Una restauración requiere evaluar escrituras posteriores al backup y autorización específica.
6. Tras validar el corte, vincula el proyecto al repositorio Next.js y configura `main` como rama de Production. Durante la vinculación, mantén desactivada la asignación automática de dominios para que el candidato validado siga sirviendo tráfico. Comprueba el origen Git y el framework antes de recuperar la asignación automática.

Consultas de diagnóstico para una sesión operativa autorizada:

```sql
select status, count(*)
from private.email_deliveries
group by status;

select job.jobname, max(run.end_time) as last_success
from cron.job job
left join cron.job_run_details run on run.jobid = job.jobid and run.status = 'succeeded'
where job.jobname in ('jmmc-publish-due-posts', 'jmmc-process-membership-mail')
group by job.jobname;
```
