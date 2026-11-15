# Proposal

## Why

La landing presenta problemas de alineación, temas incompletos, idioma inglés ausente, cambios demasiado rápidos entre demos y un acceso a membresía que no resulta utilizable. Las demos existentes tienen flujos mock implementados, pero necesitan automatización reproducible, feedback visual y correcciones de interacción para que puedan demostrarse de forma clara.

## What Changes

- Alinear el header de la landing con el contenedor real del contenido.
- Sustituir los controles textuales de tema por iconos oscuro, claro y sistema, con reacción a `prefers-color-scheme`.
- Añadir rutas equivalentes en inglés para landing, demos y autenticación, conservando la navegación equivalente entre idiomas.
- Hacer funcional el CTA `[ Acceder ]` como entrada a la modal de membresía.
- Aumentar la permanencia sticky de las demos durante el scroll.
- Añadir un reproductor mock determinista con inicio explícito, pausa, reanudación, reinicio y progreso visible en las cinco demos.
- Corregir el canvas de Leads Workflow para impedir solapamientos y hacer que `AUTO-ALIGN` produzca posiciones válidas.
- Animar la ejecución de Leads Workflow mediante un recorrido secuencial por nodos y aristas.
- Simular la entrada y progresión automática de pedidos en Orders Realtime.
- Resolver los skeletons persistentes de Lead Qualification.
- Conectar `[ VER ]` de Business Backoffice con el drawer de expediente correspondiente.
- Mejorar estados, transiciones, métricas, feedback visual y accesibilidad de todas las demos.
- Mantener mocks locales, snapshots seguros, contratos existentes y ausencia de dependencias o integraciones externas nuevas.

## Capabilities

### New Capabilities

- `landing-experience`: comportamiento del shell, header, temas, acceso a membresía y navegación sticky de demos.
- `localization`: rutas y contenido equivalentes en español e inglés para la superficie pública incluida.
- `demo-automation`: reproducción mock, automatización, visualización y estados de las cinco demos.

### Modified Capabilities

- Ninguna capability durable está registrada actualmente en `openspec/specs/`; los cambios se expresan como nuevas capabilities dentro de este change y se relacionan con las specs implementadas 02–09.

## Impact

- Afecta la arquitectura de rutas públicas bajo `app/es`, el route map, componentes compartidos de landing y autenticación, y los módulos de las cinco demos.
- Añade contratos de dominio para reproducción mock, estado secuencial de Leads Workflow y automatización de Orders Realtime.
- Requiere nuevos tests unitarios, de componentes y E2E para locales, temas, sticky, automatización, layout sin colisiones, animación y drawer.
- No añade dependencias, servicios remotos, migraciones ni cambios de producción.
