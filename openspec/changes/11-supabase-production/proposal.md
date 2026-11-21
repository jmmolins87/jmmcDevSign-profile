# Proposal

## Why

La membresía, las aprobaciones y la edición viven actualmente en el navegador, mientras la lectura pública usa fixtures independientes. El lanzamiento necesita identidad real, autorización aplicada en servidor y una única fuente persistente para que publicar desde el editor actualice la web pública.

## What Changes

- Sustituir en producción la autenticación, las sesiones y los roles mock por Supabase Auth con email y contraseña.
- Persistir solicitudes de membresía, decisiones, códigos de activación y auditoría en PostgreSQL con autorización server-side y RLS.
- Enviar confirmaciones, recuperación de contraseña, avisos al admin y códigos de activación mediante Resend.
- Sustituir la persistencia local y los fixtures públicos de posts por revisiones privadas y versiones publicadas en Supabase.
- Añadir selección de posts, creación de borradores, control de conflictos y publicación inmediata o programada desde el editor existente.
- Importar de forma repetible los tres posts públicos de la landing y provisionar un único admin real.
- Separar los entornos local, Preview y Production, validar el sistema completo y publicar en `https://www.jmmcdevsign.es` tras autorización explícita.
- Mantener las cinco demos públicas con datos simulados y conservar su experiencia bilingüe.
- Excluir del lanzamiento Google, GitHub, importación de `localStorage`, subida de portadas y persistencia de las demos.

## Capabilities

### New Capabilities

- `managed-publishing`: Membresía aprobada, autorización editorial, correo transaccional, revisiones persistentes, publicación pública y puesta en producción del sistema gestionado.

### Modified Capabilities

- Ninguna. Las capacidades existentes de landing, localización y demos conservan sus requisitos. Esta capacidad sustituye en producción los comportamientos mock descritos en las specs conversacionales anteriores.

## Impact

- Rutas afectadas: acceso, aprobación administrativa, editor y lectura pública del blog en español e inglés.
- Sistemas afectados: Next.js, Supabase Auth, PostgreSQL, Supabase Cron, Resend y Vercel.
- Se añadirán migraciones, pruebas de base de datos, clientes Supabase SSR, adaptadores server-side y configuración por entorno.
- Los contratos de dominio y la validación editorial actuales se conservarán como frontera para reducir cambios en la UI.
- La implementación deberá preservar los cambios locales no relacionados que ya existen en el árbol de trabajo.
