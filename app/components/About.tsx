/* SPEC 01 — Paso 4: sección 01 — Sobre mí (data-anim="reveal-lines"). */

import { getSiteImage } from "@/lib/data";
import { getDict } from "@/lib/i18n/server";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

export default async function About() {
  const image = getSiteImage("portrait");
  const { about } = (await getDict()).sections;
  return (
    <Section id="sobre-mi" anim="reveal-lines">
      <SectionHeading index="01" name={about.name} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Editorial Narrative */}
          <div className="lg:col-span-7 space-y-space-lg">
            <p className="font-headline-lg text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.2] text-on-surface font-normal">
              {about.lead}
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant pt-4">
              {about.body}
            </p>
            <div className="pt-6">
              <blockquote className="pl-6 border-l-2 border-primary italic font-headline-sm text-headline-sm text-on-surface-variant">
                {about.quote}
              </blockquote>
            </div>
          </div>
          {/* Right Portrait & Stats Panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Portrait Container (16:10) */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container shadow-lg group">
              <div
                className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                role="img"
                aria-label={image.alt}
                style={{ backgroundImage: `url('${image.url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-surface font-mono-code text-[11px] uppercase tracking-wider">
                {about.studio}
              </div>
            </div>
            {/* 3 Meta Stat Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <span className="font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant">
                  {about.statExperienceLabel}
                </span>
                <span className="font-display-lg text-[36px] leading-tight text-on-surface font-normal mt-2">
                  {about.statExperienceValue}{" "}
                  <span className="text-primary text-[20px]">
                    {about.statExperienceUnit}
                  </span>
                </span>
                <span className="font-mono-code text-[10px] text-outline mt-1">
                  {about.statExperienceRange}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <span className="font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant">
                  {about.statLocationLabel}
                </span>
                <span className="font-headline-sm text-[22px] leading-tight text-on-surface font-normal mt-2">
                  {about.statLocationValue}
                </span>
                <span className="font-mono-code text-[10px] text-outline mt-1">
                  {about.statLocationDetail}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-surface-container-low flex flex-col justify-between">
                <span className="font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant">
                  {about.statLanguagesLabel}
                </span>
                <span className="font-headline-sm text-[22px] leading-tight text-on-surface font-normal mt-2">
                  {about.statLanguagesValue}
                </span>
                <span className="font-mono-code text-[10px] text-outline mt-1">
                  {about.statLanguagesDetail}
                </span>
              </div>
            </div>
          </div>
        </div>
    </Section>
  );
}
