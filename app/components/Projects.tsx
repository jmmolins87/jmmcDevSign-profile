/* SPEC 01 — Paso 6: sección 04 — Proyectos + demos (data-anim="stagger-in"). */

import { demos, projects } from "@/lib/content";

export default function Projects() {
  return (
    <>
      <section
        className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-32"
        data-anim="stagger-in"
        id="proyectos"
      >
        <div className="flex items-center gap-space-md mb-16">
          <span className="font-mono-code text-mono-code text-primary uppercase tracking-[0.06em]">
            04 — Proyectos
          </span>
          <div className="h-[1px] flex-1 bg-outline-variant" />
        </div>
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project) => (
            <div
              key={project.index}
              className="group flex flex-col p-6 rounded-[14px] bg-surface-container-low border border-outline-variant transition-all duration-500 hover:shadow-xl hover:bg-surface"
            >
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-surface-variant">
                <div
                  className="absolute inset-0 bg-cover bg-center filter saturate-90 transition-all duration-700 group-hover:scale-105 group-hover:saturate-100"
                  role="img"
                  aria-label={`${project.title} — ${project.category}`}
                  style={{ backgroundImage: `url('${project.image}')` }}
                />
              </div>
              <div className="pt-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code text-[11px] text-primary uppercase tracking-wider">
                      {project.index} {"//"} {project.category}
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
                      arrow_outward
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    {project.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {project.body}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full border border-outline-variant font-label-caps text-label-caps text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Sub-block: Demos en vivo */}
        <div className="mt-24 pt-12 border-t border-outline-variant space-y-8">
          <div className="flex items-baseline justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
              Demos en vivo
            </h3>
            <span className="font-mono-code text-[11px] text-outline uppercase tracking-wider">
              Entornos Interactivos
            </span>
          </div>
          <div className="space-y-0">
            {demos.map((demo, i) => (
              <a
                key={demo.title}
                className={`group py-8 ${
                  i < demos.length - 1 ? "border-b border-outline-variant" : ""
                } flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-low transition-colors px-4 -mx-4 rounded-xl`}
                href={demo.href}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    {demo.live ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono-code text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        {demo.badge}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-code text-[10px] uppercase tracking-wider">
                        {demo.badge}
                      </span>
                    )}
                    <h4 className="font-headline-md text-[28px] sm:text-[34px] text-on-surface group-hover:text-primary transition-colors">
                      {demo.title}
                    </h4>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                    {demo.body}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono-code text-[13px] text-on-surface group-hover:text-primary transition-colors">
                  <span>Explorar sandbox</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* Hairline Divider */}
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin">
        <div className="w-full h-[1px] bg-outline-variant" />
      </div>
    </>
  );
}
