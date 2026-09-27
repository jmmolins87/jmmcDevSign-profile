/* SPEC 01 — Paso 4: sección 02 — Stack (data-anim="fill-bar").
   Las barras llevan data-level con el % objetivo para el hook de
   animación del paso 9; sin JS muestran su ancho final. */

import { getDict } from "@/lib/i18n/server";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

export default async function Stack() {
  const dict = await getDict();
  const { stack: stackSection } = dict.sections;
  const stackGroups = dict.stackGroups;
  return (
    <Section id="stack" anim="fill-bar">
      <SectionHeading index="02" name={stackSection.name} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Section Intro Sticky Left */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-normal">
              {stackSection.title}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {stackSection.intro}
            </p>
            <div className="pt-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-mono-code text-[11px] uppercase tracking-wider text-on-surface">
                {stackSection.badge}
              </span>
            </div>
          </div>
          {/* Progress Groups (Right 8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {stackGroups.map((group) => (
              <div key={group.title} className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
                  <span className="font-mono-code text-mono-code font-medium text-on-surface uppercase">
                    {group.title}
                  </span>
                  <span className="font-mono-code text-[11px] text-outline">
                    {group.note}
                  </span>
                </div>
                {group.skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between font-mono-code text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-medium">
                          {skill.name}
                        </span>
                        {skill.tag && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[9px] uppercase tracking-wider">
                            {skill.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-on-surface-variant">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                        data-level={skill.level}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
    </Section>
  );
}
