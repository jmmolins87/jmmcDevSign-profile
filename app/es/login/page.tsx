import { Card, CardContent, CardHeader, CardMeta, CardTitle } from "@/app/components/ui";
import { LoginAside, LoginPanel } from "@/app/es/login/login-panel";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <header className="grid gap-space-md border-b border-border pb-space-lg">{/* taste-skill-ignore: auth header rule from DESIGN.md */}
          <CardMeta>02 / protocolo de acceso</CardMeta>
          <h1 className="max-w-4xl font-headline text-headline-xl-mobile uppercase leading-none tracking-[-0.02em] text-primary lg:text-display-hero">
            Acceso al sistema
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Prueba la sesión local con tres perfiles y comprueba cómo cambiarán los permisos en las siguientes superficies.
          </p>
        </header>

        <div className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardMeta>Entrada / sesión de demo</CardMeta>
                <CardTitle className="mt-space-sm">Identifícate para continuar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <LoginPanel />
            </CardContent>
          </Card>
          <LoginAside />
        </div>
      </div>
    </main>
  );
}
