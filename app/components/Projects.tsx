/* SPEC 01 — Paso 6: sección 04 — Proyectos + demos (data-anim="stagger-in"). */

import { getSiteImage } from "@/lib/data";
import { getDict, withLocale } from "@/lib/i18n/server";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";
import Chip from "./ui/Chip";

export default async function Projects() {
  const dict = await getDict();
  const projects = dict.projects;
  const demos = await Promise.all(
    dict.demos.map(async (demo) => ({ ...demo, href: await withLocale(demo.href) })),
  );
  const section = dict.sections.projects;
  return (
    <Section id="proyectos" anim="stagger-in">
      <SectionHeading index="04" name={section.name} />
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
                  style={{
                    backgroundImage: `url('${getSiteImage(`project-${project.index}`).url}')`,
                  }}
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
                    <Chip key={tag}>{tag}</Chip>
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
              {section.demosTitle}
            </h3>
            <span className="font-mono-code text-[11px] text-outline uppercase tracking-wider">
              {section.demosSubtitle}
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
                      <Chip tone="live" className="px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        {demo.badge}
                      </Chip>
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
                  <span>{section.explore}</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
    </Section>
  );
}
