# Cambio de idioma de autenticación

El cambio de locale dentro de `/login` usa navegación nativa con reemplazo del
historial de autenticación. Esto sustituye el
documento completo y evita conservar un slot de modal interceptada perteneciente
al idioma anterior, o reabrirla al cerrar la traducida. Las demás superficies mantienen la navegación de Next.js y
conservan ruta, query y fragmento.

Solo la entrada interceptada `@modal/(.)login` cierra con `router.back()` para
recuperar el contexto y el foco originales. La entrada directa `/login`, incluida
la que resulta del cambio de idioma, cierra con `router.replace()` hacia el
portfolio del idioma activo; el tamaño del historial no identifica una modal
interceptada. Un `onClose` explícito conserva prioridad sobre ambas navegaciones.

`auth-locale-handoff.ts` transporta únicamente vista, nombre, correo y rol de
registro mediante un registro `sessionStorage` versionado y de un solo uso.
El registro se elimina antes de restaurarlo; se rechazan datos corruptos,
propiedades desconocidas y roles/vistas no soportados. Las contraseñas y tokens
no forman parte del contrato ni se serializan. Las contraseñas del documento
anterior también se vacían antes de la navegación y su posible caché de historial.

Si el almacenamiento está bloqueado o no puede consumirse, la navegación continúa
con un formulario vacío. No se usa almacenamiento alternativo ni se persisten
credenciales. El snapshot del servidor y de hidratación es siempre vacío; el
borrador del navegador se incorpora al suscribirse después de la hidratación.

Validación: `tests/unit/auth-locale-handoff.test.ts`,
`tests/components/public-language.test.tsx` y el recorrido real ES/EN de
`e2e/landing-experience.spec.ts`. Rollback: revertir los cambios de estos componentes
y el helper; no hay migraciones ni efectos remotos. La clave v1 de sesión es
prescindible y se consume al abrir autenticación.
