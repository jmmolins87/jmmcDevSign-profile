# Business Backoffice domain

Este módulo contiene el workspace mock de la demo Business Backoffice y su frontera sustituible:

- `backoffice-types.ts`: contratos y tipos de dominio.
- `backoffice-fixtures.ts`: datos iniciales deterministas.
- `backoffice-validation.ts`: validación estructural, reglas de entrada y búsqueda normalizada.
- `backoffice-repository.ts`: snapshot local versionado, recuperación segura y fallback en memoria.
- `backoffice-permissions.ts`: política centralizada de permisos por rol.
- `backoffice-runtime.ts`: operaciones de negocio, simulador, auditoría y exportación CSV.

La UI consume el runtime y no accede directamente a fixtures, `localStorage`, red ni proveedores externos. Para una integración futura se puede sustituir el repositorio manteniendo los contratos y la composición.
