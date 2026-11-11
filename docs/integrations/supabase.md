# Integración futura con Supabase

El proyecto está preparado para sustituir los repositorios mock por adaptadores Supabase sin activar todavía ninguna conexión remota.

## Variables

Copia el template local y completa solo las variables del entorno de desarrollo:

```bash
cp .env.example .env.local
```

Variables disponibles:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://www.jmmcdevsign.es
```

La URL y la clave anon/publishable son valores públicos para el cliente. Nunca se debe colocar `service_role`, una clave secreta o un token de administración en una variable `NEXT_PUBLIC_*`.

## Cliente preparado

`app/lib/supabase/client.ts` expone `getSupabaseClient()` y devuelve `null` si faltan la URL o la clave. El cliente se crea de forma perezosa con `persistSession: false`, `autoRefreshToken: false` y `detectSessionInUrl: false`.

La aplicación funciona sin `.env.local` porque todas las pantallas actuales usan repositorios mock. La simple creación del cliente no ejecuta consultas; cualquier llamada futura debe vivir en un adaptador de repositorio explícito.

Las tipologías están preparadas en `app/lib/supabase/database.types.ts`. Cuando exista un esquema real, se sustituirá por tipos generados y se mantendrá el contrato `DemoRepository` como frontera de la UI.

## Límites de esta spec

- No se configura Supabase Auth real.
- No se crean tablas, migraciones, políticas RLS ni datos remotos.
- No se ejecutan consultas, suscripciones realtime ni escrituras.
- No se conecta ningún repositorio mock al cliente todavía.

La URL canónica del portfolio es `https://www.jmmcdevsign.es/es/`.
