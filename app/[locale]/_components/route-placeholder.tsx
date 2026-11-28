"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Link from "@/app/components/site-link";

import {
  demoRouteList,
  demosIndexRoute,
  portfolioRouteList,
  portfolioRoutes,
  type PortfolioRouteKey,
} from "@/app/[locale]/route-map";

type RoutePlaceholderProps = {
  routeKey: PortfolioRouteKey;
};

type DemoIndexProps = {
  routeKey: "demos-index";
};

type Props = RoutePlaceholderProps | DemoIndexProps;

export function RoutePlaceholder({ routeKey }: Props) {
  const locale = useLocale();
  const t = usePublicCopy();
  const isDemoIndex = routeKey === "demos-index";
  const route = isDemoIndex ? demosIndexRoute : portfolioRoutes[routeKey];
  const routes = isDemoIndex ? demoRouteList : portfolioRouteList;

  return (
    <main className="min-h-[100svh] bg-background px-margin py-space-xl text-foreground sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto flex w-full max-w-[var(--layout-content-max)] flex-col gap-space-xl">
        <header className="flex flex-col gap-space-lg border-b border-border pb-space-xl">{/* taste-skill-ignore: route header rule from DESIGN.md */}
          <div className="flex flex-wrap items-center justify-between gap-space-md font-mono text-mono-code uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
            <span>{t("JMMC / superficies")}</span>
            <span>{t(route.eyebrow)}</span>
          </div>
          <div className="flex flex-col gap-space-md">
            <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-accent-text">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {t("Registro de demos / mock")}</p>
            <h1 className="max-w-4xl font-headline text-display-hero font-semibold tracking-tight text-primary">
              {t(route.title)}
            </h1>
            <p className="max-w-2xl text-body-lg text-on-surface-variant">
              {t(route.description)}
            </p>
          </div>
        </header>

        <section aria-labelledby="route-status" className="grid gap-space-lg lg:grid-cols-[1fr_1.5fr]">
          <div className="border border-border bg-surface-container p-space-lg">
            <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {t("Estado de las demos")}</p>
            <h2 id="route-status" className="mt-space-md font-headline text-headline-md font-medium text-primary">
              {t("Superficies disponibles")}</h2>
            <p className="mt-space-md text-body-md text-on-surface-variant">
              {t("Cada demo tiene una ruta estable, datos locales y acciones que puedes probar.")}</p>
          </div>

          <nav aria-label={isDemoIndex ? t("Navegación de demos") : t("Navegación del portfolio")} className="border border-border bg-surface-container p-space-lg">
            <p className="font-mono text-mono-code uppercase tracking-[0.18em] text-on-surface-variant">{/* taste-skill-ignore: technical metadata token from DESIGN.md */}
              {isDemoIndex ? t("Demos disponibles") : t("Mapa de superficies")}
            </p>
            <ul className="mt-space-lg grid gap-space-sm sm:grid-cols-2">
              {routes.map((item) => (
                <li key={item.href}>
                  <Link
                    className="flex min-h-12 items-center justify-between border border-border-strong px-space-md py-space-sm text-body-sm text-on-surface-variant transition-colors hover:border-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    href={localePath(item.href, locale)}
                  >
                    <span>{t(item.label)}</span>
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
