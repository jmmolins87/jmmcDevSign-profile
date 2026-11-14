# SPEC 03 — Modal de autenticación, registro y aprobación por roles

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-13
> **Objective:** Sustituir `/es/login` por una modal de autenticación con registro pendiente, fixtures locales y una frontera preparada para Supabase Auth, Google, GitHub y correo transaccional.

## Scope

**In:**

- Sustituir la superficie actual de `/es/login` por una modal de autenticación.
- Mantener `/es/login` como ruta directa que abre la modal para pruebas y enlaces externos.
- Abrir la modal desde el acceso existente del shell de la landing.
- Cerrar la modal volviendo a la página anterior mediante la navegación del navegador.
- Implementar las vistas `acceder`, `registro`, `pendiente` y `estado` de la referencia `resources/02_auth_modal`.
- Mantener visible el `DEV_SELECTOR` de estados en la interfaz de autenticación en todos los entornos.
- Permitir acceso local mock con email y contraseña.
- Mostrar controles de Google y GitHub preparados para el adaptador futuro de Supabase Auth.
- Mostrar un estado controlado de configuración pendiente cuando Google o GitHub no estén configurados localmente.
- Preparar contratos para email/password, Google y GitHub sin ejecutar OAuth remoto en local.
- Implementar el registro con nombre completo, email, contraseña, confirmación de contraseña, rol solicitado y aceptación de términos.
- Permitir solicitar únicamente los roles `editor` y `revisor`.
- Crear el usuario admin único `admin@jmmcdevsign.es` como fixture local.
- Crear los usuarios fixture `editor@jmmcdevsign.es` y `revisor@jmmcdevsign.es`.
- Sustituir el rol existente `lector` por `revisor` en tipos, fixtures, guards, textos, tests y rutas.
- Mantener `editor` y `revisor` con los mismos permisos.
- Permitir que el admin revise solicitudes, confirme o cambie el rol entre `editor` y `revisor`, apruebe la solicitud y emita el código.
- Mantener al admin como único rol que puede gestionar solicitudes y asignaciones de rol.
- Crear el estado `pending` después del registro y antes de la activación.
- Generar un código mock de seis dígitos al aprobar una solicitud.
- Hacer que el código expire a los diez minutos, sea de un solo uso y permita como máximo cinco intentos fallidos.
- Almacenar el código como digest no reversible en el modelo mock y en el contrato futuro de persistencia.
- Exponer el correo mock enviado en una bandeja de pruebas para poder verificar el flujo sin proveedor de correo real.
- Preparar `ADMIN_NOTIFICATION_EMAIL` con `admin@jmmcdevsign.es` como valor documentado de ejemplo.
- Crear una interfaz `EmailService` desacoplada para notificar al admin y enviar códigos al usuario.
- Mantener el cliente Supabase perezoso y preparar un adaptador de Auth activable mediante variables de entorno.
- Reutilizar las páginas actuales y aplicar la matriz de permisos actualizada.
- Mantener tests unitarios, de componentes y E2E para los fixtures y el flujo local mock.
- Mantener la dirección visual brutalista editorial de `resources/02_auth_modal`, los tokens existentes, foco visible, navegación por teclado y ausencia de radios y sombras difusas.

**Out of scope (for future specs):**

- Conectar la aplicación a un proyecto remoto de Supabase durante esta fase.
- Crear migraciones, tablas, políticas RLS, funciones SQL o Edge Functions.
- Ejecutar OAuth real con Google o GitHub en el entorno local.
- Implementar el proveedor real de correo transaccional.
- Enviar emails reales al admin o al usuario registrado.
- Crear una cuenta admin desde el registro público.
- Permitir roles distintos de `admin`, `editor` y `revisor`.
- Crear un gestor genérico para definir roles nuevos.
- Incluir Apple como proveedor de autenticación.
- Implementar recuperación real de contraseña.
- Crear páginas nuevas específicas para cada rol.
- Añadir un backend propio para autorización, aprobación o emisión de códigos.
- Sustituir el mock por Supabase como proveedor activo por defecto.
- Ejecutar cambios remotos, despliegues o migraciones sobre una cuenta de Supabase real.

## Data model

La implementación local mantiene un repositorio mock funcional. La integración Supabase queda representada por contratos y variables, sin persistencia remota en esta spec.

### Roles y proveedores

```ts
type UserRole = "admin" | "editor" | "revisor";

type AuthProvider = "password" | "google" | "github";

type RegistrationStatus =
  | "pending"
  | "approved"
  | "active"
  | "rejected";
```

`admin` no se puede solicitar desde el registro. `editor` y `revisor` comparten permisos.

### Usuario mock

```ts
type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  provider: AuthProvider;
  status: RegistrationStatus;
  createdAt: string;
  activatedAt?: string;
};
```

Fixtures locales:

```text
admin@jmmcdevsign.es    / jmmc-admin-demo
editor@jmmcdevsign.es   / jmmc-editor-demo
revisor@jmmcdevsign.es  / jmmc-revisor-demo
```

Las contraseñas anteriores son credenciales de demostración versionadas, no secretos ni credenciales de producción.

### Solicitud de registro

```ts
type RegistrationRequest = {
  id: string;
  email: string;
  fullName: string;
  provider: AuthProvider;
  requestedRole: "editor" | "revisor";
  assignedRole?: "editor" | "revisor";
  status: RegistrationStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};
```

El usuario solicita `editor` o `revisor`. El admin confirma o cambia el rol antes de aprobar.

### Código de verificación

```ts
type VerificationChallenge = {
  id: string;
  registrationRequestId: string;
  codeDigest: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  failedAttempts: number;
  maxFailedAttempts: 5;
  consumedAt?: string;
};
```

El código de seis dígitos se genera al aprobar, caduca diez minutos después, solo puede consumirse una vez y se invalida al alcanzar cinco intentos fallidos.

### Sesión mock

```ts
type MockSession = {
  userId: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  isAuthenticated: true;
};
```

La sesión local se conserva en `localStorage` únicamente para probar las páginas protegidas.

### Contratos de autenticación y correo

```ts
interface AuthAdapter {
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  signInWithOAuth(provider: "google" | "github"): Promise<AuthResult>;
  register(input: RegisterInput): Promise<RegistrationResult>;
  verifyRegistration(requestId: string, code: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}

interface EmailService {
  notifyAdmin(request: RegistrationRequest): Promise<void>;
  sendVerificationCode(
    request: RegistrationRequest,
    code: string,
  ): Promise<void>;
}
```

El repositorio mock implementa estos contratos para las pruebas locales. La implementación futura de Supabase se conectará sin cambiar los componentes de la modal.

### Variables de entorno

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://www.jmmcdevsign.es
ADMIN_NOTIFICATION_EMAIL=admin@jmmcdevsign.es
```

No se añade ninguna clave privada, `service_role`, token OAuth ni secreto de correo al repositorio.

## Implementation plan

1. Actualizar el dominio de autenticación para sustituir `lector` por `revisor`, conservar el admin único y definir los fixtures y permisos compartidos por editor y revisor.
2. Crear los tipos de solicitudes, estados, proveedores y códigos, junto con el repositorio mock versionado y la bandeja de correo mock.
3. Crear los contratos `AuthAdapter` y `EmailService`, preparar `ADMIN_NOTIFICATION_EMAIL` en `.env.example` y documentar que Supabase y el correo real permanecen desactivados sin configuración.
4. Sustituir la página visual de `/es/login` por el punto de entrada de la modal y conectar el acceso del shell de la landing; cerrar debe volver a la página anterior.
5. Implementar la estructura de la modal con cabecera, cierre, indicador de fase, tabs `ACCEDER`/`CREAR CUENTA`, bracket lateral y el `DEV_SELECTOR` visible en todos los entornos.
6. Implementar la vista de acceso con email/password, mostrar/ocultar contraseña, errores, logout y login de los tres fixtures locales.
7. Implementar los botones de Google y GitHub mediante el contrato de OAuth; sin configuración local deben mostrar un estado controlado de proveedor no disponible y no simular un login exitoso.
8. Implementar la vista de registro con validación de campos, confirmación de contraseña, términos y selector exclusivo de `editor`/`revisor`.
9. Implementar el alta mock como solicitud `pending`, la notificación a la bandeja mock del admin y la vista de estado pendiente para el usuario.
10. Actualizar `/es/admin/approval` para que el admin revise solicitudes, cambie el rol solicitado, apruebe, genere el código y lo envíe mediante `EmailService` a la bandeja mock.
11. Implementar la entrada del código, la validación de expiración, uso único y cinco intentos, y activar la sesión del usuario cuando la verificación sea correcta.
12. Actualizar los guards y textos de todas las páginas existentes: admin accede a todo; editor y revisor comparten todas las superficies no administrativas; solo admin gestiona solicitudes y roles.
13. Añadir tests unitarios para roles, fixtures, validación, repositorio mock, código y contratos; añadir tests de componentes para tabs, modal, estados, errores, foco y formularios.
14. Añadir E2E para abrir/cerrar la modal, login/logout de cada fixture, registro pendiente, aprobación admin, emisión y consumo de código, guards de permisos, selector de estados y viewports de 375px y 1440px.
15. Actualizar README y documentación de integración con la matriz de roles, variables de entorno, límites de Supabase y credenciales demo; ejecutar las verificaciones completas y eliminar temporales de Playwright.

## Acceptance criteria

- [x] `/es/login` abre la modal de autenticación y no muestra una página de login independiente.
- [x] El acceso del shell de `/es/` abre la misma modal.
- [x] Cerrar la modal devuelve a la página anterior sin romper la navegación del navegador.
- [x] La modal mantiene las vistas `acceder`, `registro`, `pendiente` y `estado`.
- [x] El `DEV_SELECTOR` está visible en la modal en todos los entornos y permite cambiar entre esas vistas.
- [x] La vista de acceso permite email y contraseña con validación accesible.
- [x] Los fixtures admin, editor y revisor pueden iniciar sesión localmente con las credenciales documentadas.
- [x] Cerrar sesión elimina la sesión mock y devuelve al estado anónimo.
- [x] El registro solicita nombre completo, email, contraseña, confirmación, rol y aceptación de términos.
- [x] El selector de rol solo ofrece `editor` y `revisor`.
- [x] Una solicitud nueva queda en estado `pending` y no activa la sesión antes de la aprobación.
- [x] El admin fixture puede ver las solicitudes pendientes.
- [x] El admin puede confirmar o cambiar el rol solicitado entre `editor` y `revisor`.
- [x] Ningún usuario puede solicitar o crear un segundo `admin` desde la modal.
- [x] Aprobar una solicitud genera un código numérico de seis dígitos.
- [x] El código expira a los diez minutos.
- [x] El código solo puede consumirse una vez.
- [x] El código se invalida después de cinco intentos fallidos.
- [x] El código no se almacena en texto plano en el modelo mock ni en el contrato futuro de persistencia.
- [x] La bandeja mock permite inspeccionar el correo de notificación al admin y el correo de código al usuario.
- [x] Introducir un código válido activa al usuario y permite crear su sesión.
- [x] Los códigos inválidos, expirados, consumidos o bloqueados muestran errores accesibles y no crean sesión.
- [x] Google y GitHub aparecen como proveedores disponibles en la interfaz.
- [x] Sin configuración local, Google y GitHub muestran un estado controlado de configuración pendiente y no una autenticación falsa.
- [x] Existen contratos para conectar Google y GitHub mediante Supabase Auth sin cambiar los componentes de la modal.
- [x] Existe `ADMIN_NOTIFICATION_EMAIL` en `.env.example` y se documenta su propósito.
- [x] No hay secretos, tokens OAuth, claves privadas ni credenciales de producción en el repositorio.
- [x] `lector` deja de existir en los tipos, fixtures, textos, guards y tests activos.
- [x] `editor` y `revisor` tienen exactamente los mismos permisos.
- [x] `admin` puede acceder a todas las páginas protegidas y gestionar solicitudes y roles.
- [x] Editor y revisor pueden acceder a las páginas no administrativas reutilizadas en esta spec.
- [x] Una sesión anónima recibe un estado de sesión requerida en las rutas protegidas.
- [x] Un editor o revisor no puede acceder a la gestión administrativa de solicitudes y roles.
- [x] La modal conserva foco visible, nombres accesibles, navegación por teclado y cierre seguro.
- [x] La modal mantiene la dirección visual de `resources/02_auth_modal` a 375px y 1440px.
- [x] Existen tests unitarios para roles, fixtures, solicitudes, código y repositorio mock.
- [x] Existen tests de componentes para modal, tabs, registro, estados, errores y bandeja mock.
- [x] Existen tests E2E para el flujo completo local de registro, aprobación, código y activación.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm test:e2e` pasa.
- [x] `pnpm build` pasa.
- [x] Los temporales, capturas de trabajo y carpetas de Playwright se eliminan después de la verificación.

## Decisions

- **Sí:** sustituir `/es/login` por una modal y conservar la ruta como entrada directa. Permite abrir el acceso desde la landing y mantener un punto verificable para E2E.
- **Sí:** mantener un mock local funcional para email/password y fixtures. Las páginas deben poder probarse sin una cuenta remota.
- **Sí:** preparar una frontera `AuthAdapter` para Supabase Auth. La integración remota se podrá activar posteriormente sin acoplar la UI al proveedor.
- **Sí:** preparar Google y GitHub, pero no ejecutar OAuth remoto en local. El entorno local no tiene que completar el flujo real.
- **Sí:** usar `EmailService` como frontera de correo. Permite incorporar Resend u otro proveedor sin modificar la modal ni los repositorios.
- **Sí:** usar `ADMIN_NOTIFICATION_EMAIL`. El destinatario se podrá cambiar por entorno cuando exista correo real.
- **Sí:** mantener el flujo pendiente con aprobación del único admin. El registro no activa una cuenta sin decisión administrativa.
- **Sí:** permitir que el usuario solicite editor o revisor y que el admin confirme o cambie la asignación. Conserva trazabilidad y control de privilegios.
- **Sí:** usar código de seis dígitos, diez minutos, un uso y cinco intentos. Es un contrato sencillo para la demo y deja límites verificables para la implementación futura.
- **Sí:** exponer una bandeja de correo mock. Hace verificable el flujo sin enviar mensajes reales.
- **Sí:** sustituir `lector` por `revisor`. Es el vocabulario definitivo solicitado para esta fase.
- **Sí:** mantener editor y revisor con los mismos permisos. La única diferencia de gestión es la capacidad administrativa del rol admin.
- **Sí:** mostrar el `DEV_SELECTOR` en todas las interfaces de autenticación. Es un control explícito de prueba de la referencia y se necesita para verificar estados sin herramientas externas.
- **No:** crear migraciones, tablas o RLS en esta spec. La integración persistente requiere una spec específica de modelo y seguridad.
- **No:** enviar correos reales. El proveedor y sus credenciales se definirán en una fase de infraestructura independiente.
- **No:** incluir Apple. No forma parte de los proveedores solicitados.
- **No:** crear páginas nuevas por rol. Se reutilizan las superficies existentes y se actualizan sus guards.
- **No:** guardar contraseñas de usuarios reales. Las contraseñas versionadas son exclusivamente fixtures demo.

## Risks

| Risk | Mitigation |
| --- | --- |
| La autoridad de admin queda en el mock y no puede garantizarse desde el cliente | Documentar que la autorización real deberá vivir en Supabase/RLS o una operación server-side en una spec posterior. |
| OAuth real requiere URLs de callback y proveedores configurados | Mantener el adaptador y las variables documentadas, y mostrar un estado de configuración pendiente cuando falten. |
| El flujo de correo mock puede confundirse con envío real | Etiquetar la bandeja como mock/demo y documentar que `EmailService` no entrega mensajes. |
| La sustitución de `lector` puede romper guards y fixtures existentes | Añadir búsqueda explícita de usos, tests de matriz de permisos y E2E con los tres perfiles. |
| `localStorage` no está disponible o contiene datos inválidos | Validar y normalizar sesiones y solicitudes; mantener fallback en memoria para la ejecución de la UI. |
| La navegación de modal puede perder el foco o el historial | Usar el componente modal accesible existente, gestionar foco y probar apertura/cierre con teclado y botón atrás. |
| El código mock puede quedar expuesto en la interfaz | Limitarlo a la bandeja de pruebas, marcarlo como fixture y mantener el contrato futuro basado en digest. |

## What is **not** in this spec

- Supabase Auth remoto activo.
- Migraciones, tablas, RLS, Edge Functions o backend de aprobación.
- Google o GitHub funcionando contra proveedores reales en local.
- Envío real de correo o proveedor transaccional.
- Registro público de administradores.
- Roles nuevos fuera de admin, editor y revisor.
- Apple OAuth.
- Recuperación real de contraseña.
- Páginas nuevas específicas para los roles.
- Despliegues, cambios remotos o credenciales reales.

Cada punto deberá definirse en una spec independiente cuando se incorpore.

## Notas de verificación

- 2026-11-14: verificación independiente completada con `pnpm lint`, `pnpm typecheck`, `pnpm test` (20 archivos / 51 tests), `pnpm build` y `pnpm test:e2e` (36 tests en desktop y mobile). Se añadió una regresión E2E para el overflow interno de la modal a 375px.
- 2026-11-14: Context7 no pudo responder por cuota agotada; la comprobación de Next.js 16.4.6 se contrastó con `node_modules/next/dist/docs/`.
- 2026-11-14: el MCP de Playwright no pudo inicializar Chrome porque `/Applications/Google Chrome.app` no existe y la instalación requiere `sudo`; se usó el Chromium local de Playwright como fallback, con capturas inspeccionadas visualmente a 375px y 1440px.
