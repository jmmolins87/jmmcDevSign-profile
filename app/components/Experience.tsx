/* SPEC 01 — Paso 5: sección 03 — Experiencia (data-anim="draw-line"). */

import { timeline } from "@/lib/content";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";
import Chip from "./ui/Chip";

export default function Experience() {
  return (
    <Section id="experiencia" anim="draw-line">
      <SectionHeading index="03" name="Experiencia" className="mb-20" />
        {/* Timeline Wrapper */}
        <div className="relative">
          {/* Vertical Hairline Connector */}
          <div className="hidden md:block absolute left-[220px] top-4 bottom-4 w-[1px] bg-outline-variant" />
          {/* Timeline Entries */}
          <div className="space-y-16">
            {timeline.map((entry, i) => {
              const first = i === 0;
              return (
                <div
                  key={entry.period}
                  className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start group"
                >
                  {/* Time Column */}
                  <div className="md:col-span-3 flex items-center md:justify-between pr-8">
                    <span
                      className={`font-mono-code text-mono-code uppercase tracking-[0.06em] ${
                        first
                          ? "text-primary font-semibold"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {entry.period}
                    </span>
                    {/* Dot */}
                    <div
                      className={
                        first
                          ? "hidden md:flex w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-surface items-center justify-center -mr-[25px] z-10"
                          : "hidden md:flex w-2.5 h-2.5 rounded-full bg-outline-variant ring-4 ring-surface -mr-[23px] z-10 group-hover:bg-primary transition-colors"
                      }
                    />
                  </div>
                  {/* Role & Narrative Column */}
                  <div className="md:col-span-9 md:pl-10 space-y-3">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-normal">
                      {entry.role}
                    </h3>
                    <span className="font-mono-code text-[13px] text-outline block">
                      {entry.company}
                    </span>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                      {entry.body}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {entry.tags.map((tag) => (
                        <Chip key={tag} className="px-3 py-1">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </Section>
  );
}
