import Link from "next/link";

import {
  demoRouteList,
  demosIndexRoute,
  portfolioRouteList,
  portfolioRoutes,
  type PortfolioRouteKey,
} from "@/app/es/route-map";

type RoutePlaceholderProps = {
  routeKey: PortfolioRouteKey;
};

type DemoIndexProps = {
  routeKey: "demos-index";
};

type Props = RoutePlaceholderProps | DemoIndexProps;

export function RoutePlaceholder({ routeKey }: Props) {
  const isDemoIndex = routeKey === "demos-index";
  const route = isDemoIndex ? demosIndexRoute : portfolioRoutes[routeKey];
  const routes = isDemoIndex ? demoRouteList : portfolioRouteList;

  return (
    <main className="min-h-[100svh] bg-background px-margin py-space-xl text-foreground sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-6 border-b border-border pb-8">{/* taste-skill-ignore: route header rule from DESIGN.md */}
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
            <span>JMMC / superficies</span>
            <span>{route.eyebrow}</span>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-text">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              Ruta preparada / mock
            </p>
            <h1 className="max-w-4xl font-headline text-display-hero font-semibold tracking-tight text-primary">
              {route.title}
            </h1>
            <p className="max-w-2xl text-body-lg text-on-surface-variant">
              {route.description}
            </p>
          </div>
        </header>

        <section aria-labelledby="route-status" className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <div className="border border-border bg-surface-container p-space-lg">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              Estado de implementación
            </p>
            <h2 id="route-status" className="mt-4 font-headline text-headline-md font-medium text-primary">
              Superficie conectada al mapa de rutas
            </h2>
            <p className="mt-4 text-body-md text-on-surface-variant">
              Esta pantalla ya tiene una URL estable. La interacción y los datos
              mock específicos se incorporarán en los siguientes pasos de la spec.
            </p>
          </div>

          <nav aria-label={isDemoIndex ? "Navegación de demos" : "Navegación del portfolio"} className="border border-border bg-surface-container p-space-lg">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {isDemoIndex ? "Demos disponibles" : "Mapa de superficies"}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {routes.map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex min-h-12 items-center justify-between border border-border-strong px-space-md py-space-sm text-body-sm text-on-surface-variant transition-colors hover:border-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    href={item.href}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true" className="font-mono text-accent">{/* taste-skill-ignore: technical control token from DESIGN.md */}
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

      </div>
    </main>
  );
}
